---
title: "OCTET #2: Functional Decomposition and Embedded Software Architecture"
title_zh: "OCTET 02 · 系统功能分解与嵌入式软件架构"
excerpt: "Splitting a DAQ by data flow and control flow: tasks, ring buffers, and a firmware black box."
excerpt_zh: "按数据流与控制流拆解一台采集器：任务划分、环形缓冲与固件黑匣子。"
date: 2026-11-12 10:00:00 +0800
categories: [octet, firmware]
tags: [freertos, lwip, architecture, stm32h7]
permalink: /posts/octet-02-architecture/
---

<span data-zh-title="OCTET 02 · 系统功能分解与嵌入式软件架构" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

> **OCTET series** · Part 2 of 5 · [Series index](/octet-series/) · [Prev](/posts/octet-01-requirements/) · [Next →](/posts/octet-03-usb-enumeration/)

## Decompose by data flow, not by feature list

The safest way to decompose an embedded system is along two axes — **data flow** and **control flow** — instead of listing features. This is how the OCTET firmware was split.

**Data flow (the journey of one sample):**

```
AD7768 (2×DOUT, 32bit/frame/channel)
  → SAI slave DMA (double buffer, block-complete IRQ)
    → acq task: extract 24-bit samples + verify status headers
      → push 6 KB block into ring pool (24 blocks)
        → dispatch task (the only consumer):
           ├─ save_sd on → svc_record writes FatFs
           └─ stream_net on → net_stream wraps PKT_DATA over TCP
                                 └─ one PKT_DIO per block (DI state + edge counts)
```

**Control flow:**

```
Host ─TCP 5000─► srv task: 17 commands (params / start-stop / files / time / reset)
PC broadcast ─UDP 5001─► discovery reply (any packet → dev_info_t)
TFTP client ─UDP 69─► upload/download of recordings
USB CDC ─► logs + command line (ver/sd/rtc/nv/adcreg/phy/net/tftp/trace…)
housekeeping (500 ms): LED semantics, faults, watchdog, SD recovery, USB guard
```

## Layering

```
app/
├── bsp/        clocks, MPU/Cache, GPIO, vectors, handles
├── drivers/    drv_ad7768(+capture), drv_sd, drv_pcf8563, drv_led,
│               drv_din, drv_wdt, drv_nvflash (internal-FLASH params)
├── services/   svc_acq, svc_record, svc_config, svc_sys (state/faults/LEDs),
│               svc_eventlog, svc_time
├── net/        net_ethernetif (zero-copy RX), net_phy_rtl8201, net_server,
│               net_stream, net_tftp, net_protocol (frames + CRC32)
├── port/       lwIP native FreeRTOS port, USB CDC, drv_log
└── diag/       live_trace: noinit-RAM black box
host/            Python host: daq205_tool.py (protocol) + daq205_gui.py (UI)
```

One rule: **drivers never call services, services never touch registers**. The single sanctioned "layer violation" is the diagnostic command line, which may call driver dump functions — debugging is exactly when you need to break encapsulation.

## Tasks and priorities

| Task | Stack | Prio | Duty |
|------|-------|------|------|
| acq | 6 KB | high | grab free block → SAI DMA → push filled block |
| dispatch | — | high | consume: write to SD / push to TCP |
| srv | — | mid | TCP command protocol |
| ethrx | — | mid | frame pump into lwIP |
| house | 768 words | low | 500 ms watch: LEDs, faults, recovery, watchdog |
| USB/ETH/SDMMC ISRs | — | 5–6 | all ≥ configMAX_SYSCALL |

One rule learned in blood: **the 8,200-byte capture block never lives on a task stack** — it is a `static` single instance in the acq task. Part 4 tells the story of what happened when that rule was briefly violated.

## Four designs worth a closer look

### 1. Ring buffer: 12 blocks → 24 blocks

Producer-consumer with 256 frames × 8 ch × 3 B ≈ 6 KB per block. Buffer depth is jitter tolerance:

- at 32 kSPS (125 blocks/s), 12 blocks ≈ 96 ms of headroom — plenty;
- **at 256 kSPS (1000 blocks/s), 12 blocks is only 12 ms** — any TCP hiccup drops blocks. Final depth: 24 (RAM_D1 403 KB / 512 KB), plus a 2-second debounce on the OVERRUN fault so a transient no longer latches.

### 2. Parameter storage: EEPROM → NOR → internal FLASH

The project started with an EEPROM, flirted with NOR, and finally landed on **STM32H753 internal FLASH Bank2 Sector7**: 64-byte records (magic + seq + crc32), append-only until 2048 entries force a single erase; power-on picks the highest seq. The H7's dual-bank nature means code keeps running in the other bank while parameters are erased/written.

### 3. State machine and fault codes

```
BOOT → READY → RUNNING ⇄ (record/stream)
FAULTS: 1 SD_MISSING  2 SD_IO  3 ADC_NO_DATA  4 STORAGE
        5 CFG         6 ETH_LINK  7 OVERRUN     8 RTC
```

Faults are split into fatal vs. advisory: missing storage still allows streaming; a lost link only affects the host. Transient faults like OVERRUN **must be debounced**, or one hiccup pollutes a whole session.

### 4. LED semantics

Every LED has exactly one meaning: STATUS = heartbeat from power-on; CH1–8 = enabled channels while acquiring; storage alarm = 5 Hz blink under 10 MB free; network LED = solid when a host is connected, blinking when the cable is out. Early firmware even emitted **register dumps as morse code** on the LEDs — the only evidence channel when no serial port existed (part 3).

### 5. Debuggability by design

Three facilities were designed in from day one:

1. **live_trace** — a noinit-RAM ring (48 slots × 64 B) recording boot steps, task starts and HardFault context, printed automatically after reset;
2. **CDC command line** — ver/sd/rtc/nv/adcreg/phy/net/tftp/trace/sdtest/sdfmt, usable from interrupt context even before the scheduler runs;
3. **LED diagnostic bits** — overlays on channel LEDs with highest priority.

These repeatedly saved the project: several bugs were localized when logs were dead and tasks were hung, purely from noinit evidence.

*Next: part 3 — ten rounds of USB CDC enumeration debugging.*

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

> **OCTET 系列** · 第 2 篇 / 共 5 篇 · [系列目录](/octet-series/) · [上一篇](/posts/octet-01-requirements/) · [下一篇 →](/posts/octet-03-usb-enumeration/)

## 一、功能分解：从需求到模块

需求清单拿过来，先按"数据流"和"控制流"两个维度拆模块，而不是按功能罗列——这是嵌入式系统分解最不容易漏项的方法：

**数据流（一次采样的完整旅程）**

```
AD7768 (2×DOUT, 32bit/帧/通道)
  → SAI 从机 DMA（双缓冲，块完成中断）
    → acq 任务：cap_fetch 提取 24bit 采样 + 状态头校验
      → 6KB 采集块压入环形池（24 块）
        → dispatch 任务（消费者）：
           ├─ save_sd 开启 → svc_record 写 FatFs
           └─ stream_net 开启 → net_stream 打包 PKT_DATA 推 TCP
                                 └─ 每块附带 PKT_DIO（DI 状态 + 边沿计数）
```

**控制流**

```
上位机 ─TCP 5000─► srv 任务：17 条命令（参数/启停/文件/校时/恢复出厂）
PC 广播 ─UDP 5001─► 发现应答（任意包即回 dev_info_t）
TFTP 客户端 ─UDP 69─► 下载/上传录制文件
USB CDC ─► 日志 + 命令行（ver/sd/rtc/nv/adcreg/phy/net/tftp/trace…）
housekeeping（500ms）：LED 语义、故障检测、喂狗、SD 自恢复、USB 守护
```

## 二、工程分层

```
app/
├── bsp/        板级：时钟树、MPU/Cache、GPIO、中断向量、handles
├── drivers/    器件驱动：drv_ad7768(+capture)、drv_sd、drv_pcf8563、
│               drv_led、drv_din、drv_wdt、drv_nvflash(内部FLASH参数)
├── services/   业务服务：svc_acq(采集)、svc_record(录制)、svc_config(参数)、
│               svc_sys(状态机/故障/灯效)、svc_eventlog、svc_time(RTC+兜底)
├── net/        网络：net_ethernetif(零拷贝RX)、net_phy_rtl8201、
│               net_server(TCP+UDP发现)、net_stream(推流)、net_tftp、
│               net_protocol(帧+CRC32)
├── port/       移植层：lwip 原生 FreeRTOS 移植、USB CDC、drv_log
└── diag/       live_trace：noinit RAM 黑匣子
host/           上位机：daq205_tool.py(协议栈) + daq205_gui.py(界面)
```

分层原则很简单：**drivers 不许调 services，services 不许直接碰寄存器**。唯一的"越层"是诊断命令——CDC 命令行可以直接调驱动层的 dump 函数，因为调试时就要打破封装看真相。

## 三、任务划分与优先级

| 任务 | 栈 | 优先级 | 职责 |
|------|-----|--------|------|
| acq | 6KB | 高 | 从环形池取空块→SAI DMA 填充→压入满块队列 |
| dispatch | — | 高 | 消费满块：落盘 / 推流（这是唯一"摸数据"的任务） |
| srv | — | 中 | TCP 命令协议解析与执行 |
| ethrx | — | 中 | 以太网收帧→lwIP 协议栈 |
| house | 768 字 | 低 | 500ms 看家：灯效、故障、恢复、喂狗 |
| USB/ETH/SDMMC 中断 | — | 5~6 | 全部 ≥ configMAX_SYSCALL |

一条用血换来的规则：**采集块（8200 字节）绝不放任务栈上**，acq 任务里是 `static` 单实例。第 4 篇会讲它没被执行时发生了什么。

## 四、几个值得展开的设计

### 1. 采集环形缓冲：12 块 → 24 块

采集与消费是典型的生产者-消费者模型。每块 = 256 帧 × 8 通道 × 3 字节 ≈ 6KB。缓冲深度决定抗抖动能力：

- 32kSPS 时块率 125 块/s，12 块 = 96ms 余量，绰绰有余；
- **256kSPS 时块率 1000 块/s，12 块只剩 12ms**——TCP 任何一次毫秒级抖动就丢块。最终加深到 24 块（RAM_D1 占用 403KB/512KB），并把丢块故障做 2 秒去抖，偶发抖动不再常驻报错。

### 2. 参数存储：EEPROM → NOR → 内部 FLASH 的三级演进

项目最初用 EEPROM 存参数，后来为省成本先后评估 NOR、最终落到 **STM32H753 内部 FLASH Bank2 Sector7**：

- 64 字节/条（magic + seq + crc32 + payload），**日志式追加写**，顺序写满 2048 条才擦一次；
- 上电取 seq 最大的一条，天然耐磨（约 2048×128KB 次写寿命）；
- 利用 H7 双 bank 特性，擦写参数时另一 bank 的代码照常执行，不停机。

### 3. 状态机与故障码

```
BOOT → READY → RUNNING ⇄ (record/stream)
FAULTS: 1 SD_MISSING  2 SD_IO  3 ADC_NO_DATA  4 STORAGE
        5 CFG         6 ETH_LINK  7 OVERRUN     8 RTC
```

故障分"致命"与"提示"两级：SD 缺失时仍可推流；ETH 断链只影响上位机，录照录。OVERRUN 这种"瞬时性"故障必须去抖，否则一次抖动污染整个采集会话的状态显示。

### 4. LED 语义（产品化关键细节）

12 颗灯每颗都有唯一含义，开机即进入稳定状态：

- **STATUS**：上电即 1Hz 心跳（区别于"不亮"与"故障闪码"）
- **CH1–CH8**：采集中点亮使能通道
- **存储报警灯**：SD 剩余空间不足 10MB 时 5Hz 快闪
- **网络灯**：已连接常亮 / 断网快闪 / 链路在无客户端灭

早期固件甚至用 LED 打过**摩尔斯码**来汇报寄存器转储——没有串口的时候，这是唯一能带出现场信息的通道（第 3 篇详述）。

### 5. 可调试性：设计时就埋好的三件套

1. **live_trace**：noinit RAM 环形轨迹（48 槽×64B），启动每一步、每个任务首行、HardFault 现场（CFSR/PC/LR）全部留痕，复位后自动打印上一轮；
2. **CDC 命令行**：ver/sd/rtc/nv/adcreg/phy/net/tftp/trace/sdtest/sdfmt，调度器没起来也能用（中断上下文执行）；
3. **LED 诊断位**：诊断信息可"覆盖"在通道灯上显示，优先级最高。

这三件套在后面两个月的调试中反复救场——很多 bug 是在"日志死了、任务卡死"的状态下靠 noinit 轨迹定位的。

*下一篇进入实战：[USB CDC 枚举的十轮攻防](/posts/octet-03-usb-enumeration/)——一个"所有初始化都返回 OK、设备却永远不出现"的故事。*

</div>
