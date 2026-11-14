---
title: "OCTET #1: Requirements and System Design of an 8-Channel IEPE DAQ"
title_zh: "OCTET 01 · 八通道 IEPE 采集器的需求分析与总体方案"
excerpt: "How we froze the specs, picked the parts, and made three decisions that saved us later."
excerpt_zh: "指标如何冻结、器件如何选型，以及三个在后期救了我们的需求决策。"
date: 2026-10-01 21:30:00 +0800
categories: [octet, firmware]
tags: [requirements, architecture, stm32h7, ad7768]
permalink: /posts/octet-01-requirements/
---

<span data-zh-title="OCTET 01 · 八通道 IEPE 采集器的需求分析与总体方案" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

> **OCTET series** · Part 1 of 7 · [Series index](/octet-series/) · [Next →](/posts/octet-02-architecture/)

## What problem are we solving

Condition monitoring of rotating machinery (fans, pumps, motors, spindles) always starts with **vibration data acquisition**, and IEPE accelerometers are the standard transducers. Off-the-shelf options sit at two extremes: benchtop DAQ cards are expensive and PC-bound; cheap loggers lack resolution, sync and networking.

We built something in between: a compact device that sits next to the machine, streams 24-bit vibration data to a PC over Ethernet in real time, and can also record to onboard storage on its own. Its codename is **OCTET** — *Octal-Channel Transducer & Event Telemetry* (a musical pun: 8 analog channels plus digital telemetry). Internal model number: DAQ001.

## The frozen requirement list

| Category | Requirement |
|----------|-------------|
| Analog input | 8 IEPE channels, 24-bit simultaneous sampling, up to **256 kSPS** per channel |
| Sample rates | 4k / 8k / 16k / 32k / 64k / 128k / 256k SPS |
| Digital input | 4 DI channels with timestamps and accumulated edge counters |
| Data out #1 | Onboard **SD NAND** (soldered chip, not a removable card), FAT32 recording |
| Data out #2 | 100M Ethernet real-time streaming (TCP) with live waveform preview |
| Management | UDP discovery, persistent parameters, factory reset, remote reboot |
| File access | List / download / upload / delete (TFTP + TCP dual channel) |
| Clock | Battery-backed RTC, host time sync, timestamped file names |
| Indicators | Status + power + 8 channel LEDs + storage alarm + network LED |
| Debug | USB CDC command line for field diagnosis without opening the case |

Two product-level constraints shaped the architecture:

1. **Recording and streaming are meant to be used one at a time** — 256 kSPS × 8 ch is about 6.2 MB/s, over half of a 100M link; the firmware exposes independent switches and the manual recommends picking one.
2. **Cost convergence** — the external EEPROM and NOR Flash were cut late in the project; parameters moved into MCU-internal FLASH.

## Part selection

| Part | Model | Why |
|------|-------|-----|
| MCU | **STM32H753VIT6** | 480 MHz Cortex-M7, 1 MB RAM, dual-bank FLASH (parameter storage), ETH/SAI/SDMMC/OTG_FS all present |
| ADC | **AD7768BSTZ** | 8-ch 24-bit simultaneous Σ-Δ; each frame carries an 8-bit status header (channel ID, saturation, error flags) |
| PHY | **RTL8201FI** | 10/100M MII, cheap and available |
| RTC | **PCF8563T** | I2C, battery backup |
| Storage | **SD NAND** | NAND die in an SD-protocol package; FAT32 via FatFs; survives vibration better than card slots |

A hidden bonus of the AD7768: its data port connects directly to the MCU's **SAI** peripheral as a slave DMA receiver — two DOUT lines (4 time slots each) carry all 8 channels with near-zero CPU cost. That is the hardware foundation of the 256 kSPS throughput.

## System overview

```
IEPE×8 ──► AD7768 ──SAI(DMA)──► acquisition ring buffer ──┬─► SD NAND (FatFs)
DI×4 ────► GPIO (1 ms scan + debounce)      (24 × 6 KB)   └─► TCP 5000 streaming
                                                          └─► DIO mini-frames per block
RTC(PCF8563) ──I2C──► timestamps
RTL8201F ──MII──► ETH ──► lwIP ──► TCP5000 command channel
                                   ├─► UDP 5001 discovery
                                   └─► UDP 69 TFTP file channel
USB OTG_FS ──► CDC virtual COM (logs + command line)
Host PC: Python/Tkinter — discover → connect → preview → record → file manager
```

Software stack: **FreeRTOS** + **lwIP 2.x** + **FatFs R0.15** + a home-grown binary protocol (fixed header + CRC32). The host tool is deliberately Python + Tkinter — packaged as a single-file exe with zero third-party runtime installs, because "double-click and it works" is the passing grade for industrial software on customer PCs.

## Three decisions that saved us later

Half of the bugs we hit later were already anticipated at the requirements stage:

1. **Everything moves by DMA**: SAI → ring buffer → SDMMC → Ethernet. Any CPU-polled leg collapses under interrupt latency at high sample rates (the SD RX_OVERRUN incident proved it — see part 4).
2. **No large buffers on task stacks** — written into the coding standard (and still missed once; the 8 KB stack-overflow story is also in part 4).
3. **The firmware carries its own black box**: noinit-RAM trace + LED morse codes + CDC command line, so evidence survives even when the serial port is dead and the system is hung.

*Next: part 2 — functional decomposition and software architecture.*

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

> **OCTET 系列** · 第 1 篇 / 共 7 篇 · [系列目录](/octet-series/) · [下一篇 →](/posts/octet-02-architecture/)

## 一、产品要解决什么问题

工业现场的旋转机械（风机、泵、电机、主轴）状态监测，绕不开**振动信号采集**，IEPE（压电集成电路）加速度传感器是这一领域的标配探头。但市面上的方案呈现两个极端：

- **台式采集卡**：通道多、指标高，但价格贵、体积大、依赖工控机，不适合分布式部署；
- **简易记录仪**：便宜，但采样率、位深、同步性不够，往往还不能联网。

我们要做的是介于两者之间的东西——一台**可以挂在设备旁边、通过网络把 24bit 振动数据实时推给电脑，也能脱机自己录到板载存储里**的嵌入式采集器。它的代号叫 **OCTET**（Octal-Channel Transducer & Event Telemetry，"八重奏"式的谐音双关：8 通道模拟 + 数字遥测），内部型号 DAQ001。

## 二、需求清单

把模糊的"做个采集器"收敛成可验收的指标，是整个项目最重要的一步。最终冻结的需求如下：

| 类别 | 需求 |
|------|------|
| 模拟输入 | 8 通道 IEPE，24bit 同步采样，单通道最高 **256 kSPS** |
| 采样率档位 | 4k / 8k / 16k / 32k / 64k / 128k / 256k SPS |
| 数字输入 | 4 路干接点/电平 DI，随数据流带时间戳与累计边沿计数 |
| 数据出口 ① | 板载 **SD NAND**（PCBA 集成芯片，非插拔卡）FAT32 录制 |
| 数据出口 ② | 百兆以太网实时推流（TCP），上位机实时波形预览 |
| 设备管理 | UDP 广播发现、参数掉电保存、恢复出厂、远程重启 |
| 文件管理 | 文件列表 / 下载 / 上传 / 删除（TFTP + TCP 双通道） |
| 时钟 | RTC 掉电走时，上位机可校时，录制文件按时间命名 |
| 指示 | 1 颗状态灯 + 电源灯 + 8 通道灯 + 存储报警灯 + 网络灯 |
| 调试 | USB 虚拟串口（CDC）命令行，现场免拆壳排查 |

两条关键的产品级约束，直接决定了后面的架构：

1. **录制与推流二选一为主**——百兆链路 + 6.2 MB/s 的 256k 全通道数据流，同时落盘和推流会互相挤压，产品语义上做独立开关、建议用户二选一；
2. **成本收敛**——后期明确砍掉外部 EEPROM（AT24C128C）和 NOR Flash（W25Q128），参数存储改用 MCU 内部 FLASH。

## 三、核心器件选型

| 器件 | 型号 | 选型理由 |
|------|------|----------|
| MCU | **STM32H753VIT6** | 480MHz Cortex-M7、1MB RAM、双 bank FLASH（参数存储）、ETH/SAI/SDMMC/OTG_FS 全齐 |
| ADC | **AD7768BSTZ** | 8 通道 24bit 同步采样 Σ-Δ，每通道自带 8bit 状态头（含通道号、饱和、错误标志），抗混叠滤波器内置 |
| PHY | **RTL8201FI** | 10/100M，MII 接口，成本低、货源稳 |
| RTC | **PCF8563T** | I2C 接口、带电池后备，掉电走时 |
| 存储 | **SD NAND** | 焊接式 NAND 封装成 SD 协议，FAT32 直接用 FatFs 管理，抗振动优于插拔卡 |

AD7768 的选择有个隐藏红利：它的数据口可以直连 MCU 的 **SAI** 外设做从机 DMA 接收，2 条 DOUT 线（每线 4 通道时隙）就能搬完 8 通道数据，CPU 几乎零开销——这是后面 256kSPS 大吞吐的硬件基础。

## 四、总体架构

```
IEPE×8 ──► AD7768 ──SAI(DMA)──► 采集环形缓冲 ──► ┬─► SD NAND（FatFs 落盘）
DI×4 ───► GPIO(1ms 扫描+消抖)        (24块×6KB)   └─► TCP 5000 推流
                                                  └─► DIO 小帧随块下发
RTC(PCF8563) ──I2C──► 时间戳
RTL8201F ──MII──► STM32 ETH ──► lwIP ──► TCP5000 命令通道
                                  ├─► UDP 5001 发现
                                  └─► UDP 69  TFTP 文件通道
USB OTG_FS ──► CDC 虚拟串口（日志 + 命令行）
PC 上位机：Python/Tkinter，发现→连接→预览→录制→文件管理→校时
```

软件栈：**FreeRTOS**（任务调度）+ **lwIP 2.x**（网络）+ **FatFs R0.15**（文件系统）+ 自研二进制协议（帧头 + CRC32）。上位机刻意选了 Python + Tkinter——零第三方依赖打包成单文件 exe，现场电脑双击就能用，不需要安装环境。

## 五、需求阶段就定下的三个"防坑"决策

回头看，这个项目后期踩的坑，一半都能在需求阶段提前规避。我们在方案冻结时明确写下：

1. **数据通路必须 DMA 全程**：SAI→环形缓冲→SDMMC→以太网，任何一段用 CPU 轮询搬运，在高采样率下都会被中断延迟拖垮（后来 SD 的 RX_OVERRUN 事故验证了这条）；
2. **任何大缓冲禁止放任务栈上**：写入编码规范（这条仍然漏了一次，第 4 篇的 8KB 栈溢出事故见分晓）；
3. **固件自带"黑匣子"**：noinit RAM 轨迹记录 + LED 摩尔斯码 + CDC 命令行，保证"串口看不见、系统死了"的情况下依然能取证。

*下一篇：把需求拆成模块——[系统功能分解与嵌入式软件架构](/posts/octet-02-architecture/)。*

</div>
