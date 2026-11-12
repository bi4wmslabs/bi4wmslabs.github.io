---
title: "OCTET #5: Protocol Design, Host Software and Product Release"
title_zh: "OCTET 05 · 通信协议、上位机与产品化交付"
excerpt: "A binary protocol built for third-party integration, a frame-hungry-proof host architecture, and the productization checklist."
excerpt_zh: "为第三方集成而设计的二进制协议、防吃帧的上位机架构，以及产品化收尾清单。"
date: 2026-11-12 14:00:00 +0800
categories: [octet, firmware]
tags: [protocol, python, gui, product]
permalink: /posts/octet-05-protocol-and-product/
---

<span data-zh-title="OCTET 05 · 通信协议、上位机与产品化交付" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

> **OCTET series** · Part 5 of 5 · [Series index](/octet-series/) · [Prev](/posts/octet-04-debugging-adc-sd/)

## A binary protocol designed for third parties

When a device is sold to customers and integrated into their systems, the protocol document is a second product. Three principles only: **fixed header, CRC32 over header+payload, structs that map 1:1 onto the wire**.

### Frame format

```
| Off | Field   | Size | Notes                                        |
|-----|---------|------|----------------------------------------------|
| 0   | magic   | 2 B  | 0xDA05                                       |
| 2   | version | 1 B  | protocol version                             |
| 3   | type    | 1 B  | 0x00 RSP / 0x01 CMD / 0x02 DATA / 0x04 EVT / 0x05 DIO |
| 4   | status  | 1 B  | RSP: 0 ok / 1 param / 2 busy / 3 state / 4 storage / 7 nomem |
| 5   | reserve | 1 B  |                                              |
| 6   | plen    | 2 B  | payload length                               |
| 8   | seq     | 4 B  | sequence number                              |
| 12  | crc32   | 4 B  | header+payload (incrementally computed)      |
| 16  | payload | plen |                                              |
```

Seventeen commands: GET_INFO / SET_NET / SET_TIME / GET_STATUS / SET_ACQ / ACQ_START / ACQ_STOP / FILE_LIST / FILE_READ / FILE_DEL / FACTORY_RESET / REBOOT… all strict request-response, with `seq` and `status` echoed back. A third party can implement a client from the document alone.

### Three side channels

- **UDP 5001 discovery** — broadcast anything, the device answers with dev_info_t (name / IP / version / channels): zero-configuration hosts;
- **UDP 69 TFTP** — bulk download/upload of recordings, blksize negotiated up to 1428 bytes (no IP fragmentation), busy error while acquiring;
- **PKT_DIO per block** — 4 DI state bits + accumulated edge counts, emitted with each data block so both share one time axis.

## Three host-software decisions

### 1. A dedicated reader thread

GUI command polling, waveform preview and file transfer share one TCP connection; any "send commands while receiving data" scheme steps on frames. Final shape:

```
socket ──► reader thread (exclusive recv + frame parser)
             ├─ DATA → pending_data queue (preview / recording)
             ├─ RSP  → rsp_queue (command() waits here)
             └─ EVT  → evt_queue
```

`command()` only sends; `read_data_frame()` only dequeues. Same public API, zero races.

### 2. Oscilloscope-style rendering

At high rates the enemy is full repaint per packet. Envelope downsampling + 30 FPS dirty-frame repaint + `coords()` in-place updates keep Tkinter smooth at 256 kSPS (part 4; under 35% of one core measured).

### 3. Single-file exe delivery

PyInstaller `--onefile --windowed`, excluding numpy/matplotlib (67 MB → ~12 MB), with a `--selftest` flag for automated verification. **Double-click, zero install** — the passing grade for industrial host software. The UI went through three rounds: deep-blue tech → Apple liquid glass → **Scopy-style dark instrument** (neutral gray panels, steel-teal accent, scope trace colors) — landing on restrained "professional instrument software."

## The productization checklist

| Item | Content |
|------|---------|
| Branding | OCTET codename end-to-end: window title, device name, USB enumeration, CDC prompt, documents |
| Wording | "SD card" → "onboard SD NAND (not removable)"; LED descriptions match hardware exactly |
| LEDs | STATUS heartbeat / power / CH1–8 acquiring / storage alarm / network status, each defined in the manual |
| Docs | User manual (V1.5, PDF+MD) + protocol spec (V1.4, PDF+MD) + this blog series |
| Storage | Parameters in internal FLASH (append-only log); EEPROM and NOR fully removed from BOM and firmware |
| Version | Firmware and host unified at 1.2.0, verified by `--selftest` |

## Quick start (manual digest)

1. **Wire up**: IEPE sensors to CH1–CH8, Ethernet to RJ45, power on. STATUS heartbeat = ready;
2. **Discover**: same subnet (default `192.168.66.55`), run the host exe, click Discover;
3. **Acquire**: pick channels and sample rate → check "stream to network" for live waveforms and the 4-DI ladder; check "save to onboard storage" for standalone recording — download `.bin` files later and convert to `.wav` automatically;
4. **Time sync**: the Sync button writes PC time into the RTC so recording filenames are correct;
5. **Maintenance**: TFTP bulk download/delete on the file page; the storage LED blinks under 10 MB free; factory reset returns IP to 192.168.66.55.

## Closing the series

Two months from the first line of firmware to the 1.2.0 release build. The most valuable takeaways are not the individual bug fixes but three methods:

1. **Evidence over assumption** — every "should be" must become "measured is": register read-backs, offline spectra, noinit traces, camera-decoded LED codes;
2. **Observability is designed, not retrofitted** — live_trace, CDC commands and LED diagnostic bits were in the architecture from the requirements stage;
3. **Documentation is product** — protocol spec, manual, and selftest ship with the firmware in version control, or third-party integration and after-sales support never happen.

*Series complete.*

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

> **OCTET 系列** · 第 5 篇 / 共 5 篇 · [系列目录](/octet-series/) · [上一篇](/posts/octet-04-debugging-adc-sd/)

## 一、二进制协议：为第三方集成而设计

设备要卖给客户、要被客户的系统集成，协议文档就是第二份产品。设计原则只有三条：**定长帧头、CRC32 全覆盖、结构体对齐即字节序**。

### 帧结构

```
| 偏移 | 字段     | 长度 | 说明                        |
|------|----------|------|-----------------------------|
| 0    | magic    | 2B   | 0xDA05                      |
| 2    | version  | 1B   | 协议版本                    |
| 3    | type     | 1B   | 0x00 RSP / 0x01 CMD / 0x02 DATA / 0x04 EVT / 0x05 DIO |
| 4    | status   | 1B   | RSP：0 成功 / 1 参数 / 2 忙 / 3 状态 / 4 存储 / 7 无内存 |
| 5    | reserve  | 1B   |                             |
| 6    | plen     | 2B   | 负载长度                    |
| 8    | seq      | 4B   | 序号                        |
| 12   | crc32    | 4B   | 帧头+负载（增量 CRC 计算）  |
| 16   | payload  | plen |                             |
```

命令集 17 条：GET_INFO / SET_NET / SET_TIME / GET_STATUS / SET_ACQ / ACQ_START / ACQ_STOP / FILE_LIST / FILE_READ / FILE_DEL / FACTORY_RESET / REBOOT……全部"一问一答"，RSP 帧原样带回 seq 与 status，第三方照文档即可实现客户端。

### 三条辅助通道

- **UDP 5001 发现**：向网段广播任意包，设备回 RSP+dev_info_t（名称/IP/版本/通道数）——上位机免配置；
- **UDP 69 TFTP**：录制文件批量下载/上传，blksize 协商到 1428 字节（不分片），采集中回 busy；
- **PKT_DIO 随块下发**：4 路 DI 状态位图 + 累计边沿计数，与数据块同拍，时间轴天然对齐。

完整协议文档（V1.4）随仓库开源，并附 Python 最小客户端示例——拿着 200 行代码就能自己写上位机。

## 二、上位机工程化的三个关键决策

### 1. 专用读线程架构

GUI 的命令轮询、波形预览、文件传输共用一条 TCP 连接，任何"边发命令边收数据"的实现都会踩丢帧的坑。最终形态：

```
socket ──► reader 线程（独占 recv + 逐帧解析）
             ├─ DATA → pending_data 队列（预览/录制取用）
             ├─ RSP  → rsp_queue（command 等待）
             └─ EVT  → evt_queue
```

`command()` 只发不收；`read_data_frame()` 只从队列取。接口不变，竞争消失。

### 2. 示波器式渲染

数据量大时，GUI 渲染的敌人是"每包全量重绘"。包络降采样 + 30FPS 脏帧重绘 + `coords()` 原地更新，让 Tkinter 在 256kSPS 下也能丝滑滚动（第 4 篇已详述，实测单核占用 <35%）。

### 3. 单文件 exe 交付

PyInstaller `--onefile --windowed`，排除 numpy/matplotlib 等拖体积的依赖（67MB→12MB 级），`--selftest` 参数支持自动化验证。现场电脑**双击即用、零安装**，这是工业软件的及格线。

界面经过三轮迭代：深夜蓝科技风 → Apple 液态玻璃 → **Scopy（ADI）深色仪器风**——中性深灰面板、钢青强调色、示波器迹线色，最终收敛在"像专业仪器软件"的克制风格上。中英双语一键切换，全量 retranslate。

## 三、产品化收尾清单

技术功能完成后，产品化还差最后一公里，逐项打勾：

| 项 | 内容 |
|----|------|
| 品牌 | 代号 OCTET 全链路接入：窗口标题、设备名上报、USB 枚举名、CDC 提示符、文档 |
| 界面文案 | "SD 卡"→"板载 SD NAND（非可插拔）"，LED 描述与硬件一一对应 |
| 指示灯语义 | STATUS 心跳 / 电源 / CH1-8 采集 / 存储报警 / 网络状态，说明书逐灯定义 |
| 文档 | 《使用说明书》（V1.5，PDF+MD）+《通信协议说明》（V1.4，PDF+MD）+ 本系列博客 |
| 存储 | 参数存内部 FLASH（日志式追加），EEPROM/NOR 从 BOM 与固件中完全移除 |
| 版本 | 固件/上位机统一 1.2.0，`--selftest` 自动化验证 |

## 四、快速上手（说明书摘要）

1. **接线**：IEPE 传感器接 CH1–CH8，网线接 RJ45，上电。STATUS 灯进入心跳即系统就绪；
2. **发现设备**：电脑与设备同网段（默认 `192.168.66.55`），双击上位机 exe → 点"发现设备"；
3. **采集**：采集页勾选通道与采样率 → 勾"网络推流"点开始，监控页实时波形 + 4 路数字量阶梯图；勾"保存到板载存储"则脱机录制，事后文件管理页下载 `.bin` 并自动转 `.wav`；
4. **校时**：网络页"校时"按钮把电脑时间写入 RTC，录制文件名时间即正确；
5. **维护**：文件管理页 TFTP 批量下载/删除；存储剩余 <10MB 时存储报警灯快闪；恢复出厂后 IP 回到 192.168.66.55。

## 五、写在系列最后

两个月，固件从第一行代码到 1.2.0 发布版，上位机从单文件脚本到产品级工具。复盘整个项目，最有价值的不是某个具体 bug 的修复，而是三条方法论：

1. **实证优先**：每个"应该是"都要变成"实测是"——寄存器回读、离线频谱、黑匣子轨迹、摄像头灯语，都是在为判断提供证据链；
2. **可观测性是设计出来的**：live_trace、CDC 命令、LED 诊断位在需求阶段就写进了架构，调试时才有得用；
3. **文档即产品**：协议文档、说明书、selftest 和固件一起进入版本管理，第三方集成、售后维护、二次开发才有可能。

*系列完。*

</div>
