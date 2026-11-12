---
title: "OCTET #6: DAQ205 User Manual, V1.5"
title_zh: "OCTET 06 · DAQ205 使用说明书 V1.5"
excerpt: "The official user manual: connectors and LEDs, quick start, host software pages, recording file formats, fault codes and FAQ."
excerpt_zh: "正式使用说明书全文：接口与指示灯、快速上手、上位机各功能页、录制文件格式、故障码与常见问题。"
date: 2026-11-12 16:00:00 +0800
categories: [octet, documentation]
tags: [manual, daq205, iepe, host-software]
permalink: /posts/octet-06-user-manual/
---

<span data-zh-title="OCTET 06 · DAQ205 使用说明书 V1.5" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

> **OCTET series** · Part 6 of 7 · [Series index](/octet-series/) · [Prev](/posts/octet-05-protocol-and-product/) · [Next →](/posts/octet-07-protocol-spec/)

> **Release note:** This is the official V1.5 user manual shipped with firmware 1.2.0 and host software 1.2.0, reproduced here in full. The Chinese PDF is available at the end of this article.

**Product name** **OCTET** (Octal-Channel Transducer & Event Telemetry)
**Internal model** DAQ205 — the storage directory, recording filenames and protocol magic keep the DAQ205 naming
**Document version** V1.5 · **Firmware** 1.2.0 · **Host software** 1.2.0
**Released** 2026-11-12 · **Developed / copyright** BI4WMS LABS

---

## 1. Product overview

The DAQ205 is an **8-channel, 24-bit simultaneous-sampling data acquisition unit** for industrial field use (vibration, acoustic and shock IEPE sensor applications), with **4 digital inputs** for monitoring.

Core components:

| Part | Device | Notes |
|------|--------|-------|
| ADC | AD7768BSTZ | 8-channel 24-bit sigma-delta simultaneous sampling |
| MCU | STM32H753VIT6 | FreeRTOS + lwIP |
| Ethernet | RTL8201FI | 10/100M auto-negotiation |
| RTC | PCF8563T | Battery-backed clock; timestamped data |
| Storage | Onboard SD NAND + internal FLASH | Data logging, parameters retained across power loss |
| Debug | USB CDC virtual COM port | Driver-free on Windows, logs and diagnostics |

Key capabilities:

- Selectable sample rates 4k / 8k / 16k / 32k / 64k / 128k / **256k SPS** (default 32k)
- Acquired data can go to **onboard local recording** and **real-time network streaming** (independent switches)
- Host software: live waveform preview and WAV recording (24-bit, multi-channel)
- 4 digital inputs streamed live with accumulated edge counts (display only, never stored)
- Event log with over a thousand entries, watchdog protection, power-safe parameter storage
- TCP 5000 for commands and data, UDP 5001 automatic discovery, TFTP (UDP 69) bulk file copy
- One-click EN / 中文 switching in the host software

---

## 2. Specifications

| Item | Specification |
|------|---------------|
| Analog inputs | 8 × IEPE channels (CH1–CH8), 24-bit, simultaneous sampling |
| Sample rates | 4k / 8k / 16k / 32k (default) / 64k / 128k / 256k SPS |
| Data format | 24-bit signed little-endian, frame-interleaved |
| Digital inputs | 4 channels (DI1–DI4), opto-isolated, 5 ms sampling + 3-sample debounce |
| Network | 10/100M Ethernet (RJ45) |
| Command/data port | TCP 5000 |
| Discovery port | UDP 5001 (broadcast) |
| File transfer | TFTP server, UDP 69 |
| Data storage | Onboard SD NAND chip (PCBA-integrated, not a removable SD card), FAT32, directory `/DAQ205/DATA` |
| Parameter storage | Internal FLASH, log-structured append, retained across power loss |
| RTC | PCF8563T, Unix time, UTC internally |
| Host software | Single-file Windows executable `DAQ205_Host.exe`, no installation |
| Debug interface | USB CDC virtual COM port (OTG_FS, PA11/PA12) |
| Reliability | External watchdog fed at 1 Hz; ring buffers absorb SD/network jitter |

> For power-up, wiring and supply polarity, refer to the silkscreen and the hardware design files.

---

## 3. Hardware

### 3.1 Connectors

| Connector | Function |
|-----------|----------|
| CH1–CH8 input terminals | IEPE analog channels for vibration / acoustic sensors |
| DI1–DI4 input terminals | Digital inputs (opto-isolated, active low) |
| RJ45 | Ethernet, 10/100M auto-negotiation |
| Onboard SD NAND | PCBA-integrated storage chip (not removable), holds recorded data |
| USB port | Debug logs / diagnostic commands (CDC virtual COM port) |
| KEY button | Short press starts/stops acquisition; hold 5 s for factory reset |
| LEDs | STATUS ×1 + PWR ×1 + channel LEDs CH1–CH8 ×8 + storage alarm ×1 + network ×1 |

### 3.2 LED definitions

**STATUS (system status)**

| State | Behaviour |
|-------|-----------|
| Normal operation | Heartbeat blink (blinking whenever powered) |
| Factory reset in progress | Fast blink |
| Fault present | Blinks N times + pause, repeating (N = fault code) |

**PWR (power indicator)**

| State | Behaviour |
|-------|-----------|
| Power OK | Steady on |

**Channel LEDs CH1–CH8 (analog channels)**

| LED | Meaning |
|-----|---------|
| CH1–CH8 | Enabled analog channels light up during acquisition |

**Storage alarm LED CH9**

| State | Behaviour |
|-------|-----------|
| Normal | Follows the DI1 level |
| Free storage < 10 MB | Fast blink (overrides the DI1 display); copy and clear data promptly |

**Network LED CH10**

| State | Behaviour |
|-------|-----------|
| Normal | Follows the DI2 level |
| No cable | Fast blink (overrides the DI2 display) |
| Link up, no host connected | Off (overrides the DI2 display) |
| Host connected | Steady on (overrides the DI2 display) |

> DI3 / DI4 have no dedicated LEDs; they are only shown in the host software over the network stream.

### 3.3 Button

| Action | Effect |
|--------|--------|
| Short press (< 1 s) | Start / stop local acquisition (using the current acquisition parameters) |
| Hold 5 s | **Factory reset**: IP returns to 192.168.66.55, all configuration is reset and the device reboots |

---

## 4. Quick start

1. **Wiring**: connect IEPE sensors to CH1–CH8 and an Ethernet cable to RJ45.
2. **Power up**: the PWR LED stays on and STATUS enters its heartbeat; with a working cable the network LED does not blink fast.
3. **Discover the device**: put the PC on the same LAN as the device (defaults to
   `192.168.66.55 / 255.255.255.0 / 192.168.66.1`), double-click `DAQ205_Host.exe`
   and press **Discover**; alternatively type `192.168.66.55` into the IP field and press **Connect**.
4. **Connected**: the device information appears on the left, the network LED stays on and the status bar reads "Connected".
5. **Start acquisition**: on the **Acquisition** page set channels / sample rate / save-to-storage / streaming,
   press **Apply acquisition parameters**, then **Start acquisition**; return to **Monitor** for a live waveform preview.
6. **Record WAV**: tick **Record WAV**, enter an output path and press **Start recording**.

> Only **one** TCP client can be connected to the device at a time.

---

## 5. Host software

### 5.1 Running it

No installation is needed: double-click `DAQ205_Host.exe` in the project root (or run
`python host/daq205_gui.py` from source — Python 3.9+ with tkinter is required, and the
debug terminal page additionally needs `pip install pyserial`).
The **EN / 中文** button in the top-right switches the entire interface, including device information.

### 5.2 Monitor

- Device info: name / firmware version / MAC / IP / port / channel count / sample rate / serial number / build time
- **Start / Stop / Set time / Refresh status** shortcut buttons
- Status row: running state + fault code + digital input bitmap
- Link row at the bottom: network link, free SD space, frame count, overruns, heap
- Live waveforms: select any combination of CH1–CH8 on the right
- Digital input panel: DI1–DI4 level step chart + accumulated edge counts (display only, not stored)

### 5.3 Acquisition

| Item | Description |
|------|-------------|
| Enabled channels | e.g. `1 2 3`; leave empty for all 8 channels |
| Sample rate | 4k–256k SPS |
| Duration (ms) | 0 = continuous, started and stopped by the host |
| Save to onboard storage | Writes acquired data to disk (`.bin` + `.json`) |
| Network streaming | Pushes data to the host over TCP 5000 |
| Record WAV | Writes streamed data to a 24-bit WAV in real time (set the output path first) |

Parameters are saved to the MCU internal FLASH and survive power loss.

### 5.4 Files

- Lists every file under `/DAQ205/DATA` (refreshed automatically after connecting)
- **Copy to PC / Copy all**: TFTP by default (fast), switchable to the TCP command channel;
  tick "convert to WAV after copy" to turn `.bin` into `.wav`
- **Upload to storage**: over TFTP
- **Delete selected**: over the TCP command channel, multi-select supported (rejected during acquisition)
- The file list is unavailable during acquisition / recording (to avoid contention on the storage bus)

### 5.5 Network

- Edit IP / mask / gateway / TCP port and press **Apply** — takes effect immediately and is saved across power loss;
  reconnect using the new address afterwards
- **Factory reset**: returns the IP to 192.168.66.55 and resets all configuration
- **Reboot device**

### 5.6 Debug console

- Connect a USB cable to the device OTG_FS port (virtual COM port), select the serial port in the page and press **Open port**
- Firmware debug commands can then be entered interactively (`help` / `ver` / `sd` / `rtc` / `nv` / `adcreg` /
  `tftp` / `phy` …), with echo, backspace and up/down command history — no third-party serial tool needed
- The debug console is independent of the network connection; it needs Python `pyserial` (bundled in the exe)

### 5.7 Command-line tool (scripts / automation)

```bash
python host/daq205_tool.py discover                      # broadcast discovery
python host/daq205_tool.py info    --ip 192.168.66.55    # device info
python host/daq205_tool.py status  --ip 192.168.66.55    # running status
python host/daq205_tool.py set-acq --ip 192.168.66.55 --mask 0xFF --odr-index 3 --duration-ms 5000
python host/daq205_tool.py set-net --ip 192.168.66.55 --new-ip 192.168.66.60
python host/daq205_tool.py record  --ip 192.168.66.55 -o a.wav --duration 5
python host/daq205_tool.py preview --ip 192.168.66.55 --channels 0 1 2
python host/daq205_tool.py list    --ip 192.168.66.55
python host/daq205_tool.py tftp-get --ip 192.168.66.55 --name xxx.bin -o xxx.bin
python host/daq205_tool.py tftp-put --ip 192.168.66.55 --file local.bin
python host/daq205_tool.py wav      --file xxx.bin -o xxx.wav
```

---

## 6. Data file format

Onboard storage directory `/DAQ205/DATA/`, filenames `<timestamp>_<N>CH_<ODR>sps.bin`.

- **.bin**: a 52-byte header (`rec_header_t`, magic `"D205BIN"`, containing channel count,
  channel mask, nominal sample rate, start Unix time, total frame count and more) followed by
  frame-interleaved 24-bit little-endian samples. The sample area of the network stream uses the same format.
- **.json**: metadata generated automatically when recording stops (channel count, sample rate, frame count, start/end time, …).
- **.wav**: converted by the host with `nchannels = ch_count, sampwidth = 3, framerate = odr`;
  opens directly in any audio or analysis software.

For the byte-level layout see [part 7, Communication Protocol and Data Format](/posts/octet-07-protocol-spec/).

---

## 7. Time and RTC

- The device has a built-in PCF8563T real-time clock; all internal timestamps are stored in **UTC**
- The host **Set time** button (SET_TIME) writes the PC's current time into the RTC
- Recording filenames, `.json` metadata, event logs and stream timestamps all derive from the RTC
- A power-loss or communication fault on the RTC raises `FAULT_RTC (10)`; timestamps are then unreliable — set the time first

---

## 8. Parameter storage and factory reset

- All parameters (network / acquisition) live in the STM32 internal FLASH using a **log-structured append + CRC32** scheme,
  power-safe and written immediately on every change
- Factory reset (host button or holding KEY for 5 s) erases the parameter sector and writes defaults:
  `192.168.66.55 / 255.255.255.0 / 192.168.66.1`, TCP 5000,
  all 8 channels enabled, 32 kSPS, continuous acquisition, storage + streaming

---

## 9. Fault codes

| Code | Name | Meaning |
|-----:|------|---------|
| 0 | No fault | — |
| 1 | SD_MISSING | Storage not ready |
| 2 | SD_IO | Storage read/write error |
| 3 | ADC_NO_DATA | No data from AD7768 (clock / reset fault) |
| 4 | ADC_CFG | AD7768 configuration readback verification failed |
| 5 | Reserved | (legacy parameter storage corruption) |
| 6 | ETH_LINK | Ethernet cable disconnected (network LED blinks fast) |
| 7 | OVERRUN | Acquisition data overrun (processing fell behind) |
| 8 | OVERTEMP | Overtemperature |
| 9 | Reserved | (legacy external NOR error) |
| 10 | RTC | RTC power loss / communication fault |

On a fault the STATUS LED blinks N times followed by a pause in a loop (N = fault code),
and the host status row shows the same code.

---

## 10. USB CDC debug commands

After connecting a USB cable a virtual COM port appears (any baud rate); type a command and press Enter.
You can interact directly on the host **Debug console** page (echo / backspace / history), or use
any serial terminal:

| Command | Function |
|---------|----------|
| `help` | Help |
| `ver` | Firmware version and build time |
| `sd` | Storage mount and capacity |
| `acq` | ADC / acquisition running state |
| `adcreg` | Key AD7768 registers |
| `scan` | Scan every PHY address on the MDIO bus |
| `phy` | PHY registers and link state |
| `eth` | ETH MAC/DMA registers and RX/TX counters |
| `tftp` | TFTP transfer statistics |
| `nv` | Parameter storage (slots / write count) |
| `rtc` | RTC time |
| `trace` | Acquisition trace |

---

## 11. FAQ

**Q: The discovery list is empty?**
Check the cable and the network LED (it blinks fast when no cable is connected); the device and PC must be on the same subnet.
You can also connect by typing the IP directly.

**Q: I changed the IP and cannot reconnect?**
The device switches to the new IP as soon as the network parameters are applied, so reconnect using the new address.
If you forgot it, hold KEY for 5 s to restore factory defaults (back to 192.168.66.55).

**Q: File listing / file operations report busy?**
File operations are forbidden while acquisition or recording is running — stop acquisition first.

**Q: Streaming drops blocks (flags bit0 or OVERRUN)?**
Use a 100M full-duplex link; lower the sample rate or stream fewer channels; check PC performance.
Streaming **256 kSPS × 8 channels** is about 6.2 MB/s (over half of a 100M link), so we recommend
choosing **either "save to onboard storage" or "network streaming"** — enabling both easily triggers OVERRUN.
The host needs numpy (`pip install numpy`) for a smooth preview (bundled in the exe).
OVERRUN is a transient indication: it is shown only if blocks were still being dropped within the last 2 seconds,
so occasional jitter clears by itself.

**Q: Recording timestamps are wrong?**
The RTC has not been set. Connect, press **Set time**, then record.

**Q: The storage alarm LED blinks fast?**
Free storage is below 10 MB — copy the data off and clean up promptly.

---

## 12. Cautions

1. Only one TCP client is supported at a time.
2. Live preview and WAV recording share the same stream and cannot run simultaneously.
3. Do not power off or reset during acquisition / recording (storage writes are in progress).
4. The event log lives in RAM (256 entries) and is **not retained across power loss**; read it in the host if you need to keep it.
5. A 100M full-duplex network is recommended; 10M half-duplex may drop blocks at high sample rates.

[Download the official Chinese PDF (V1.5)](/assets/docs/octet-daq205-user-manual-v1.5-zh.pdf)

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

> **OCTET 系列** · 第 6 篇 / 共 7 篇 · [系列目录](/octet-series/) · [上一篇](/posts/octet-05-protocol-and-product/) · [下一篇 →](/posts/octet-07-protocol-spec/)

> **版本说明**：本文为随固件 / 上位机 1.2.0 正式发布的《使用说明书》V1.5 全文，中文 PDF 见文末。原文提到的 `docs/protocol.md` 已作为本系列第 7 篇发布。

**产品代号** **OCTET**（Octal-Channel Transducer & Event Telemetry，八通道传感与事件遥测）
**内部型号** DAQ205（存储目录、录制文件名沿用 DAQ205 命名，协议 magic 不变）
**文档版本** V1.5 · 对应固件 **1.2.0** · 对应上位机 **1.2.0**
**发布日期** 2026-11-12 · **开发 / 版权** BI4WMS LABS

---

## 1. 产品简介

DAQ205 是一台面向工业现场（振动 / 声学 / 冲击等 IEPE 传感器应用）的
**8 通道 24bit 同步数据采集器**，并集成 **4 路数字量输入**监视。

核心组成：

| 部件 | 器件 | 说明 |
|------|------|------|
| ADC | AD7768BSTZ | 8 通道 24bit Σ-Δ 同步采样 |
| 主控 | STM32H753VIT6 | FreeRTOS + lwIP |
| 以太网 | RTL8201FI | 10/100M 自适应 |
| RTC | PCF8563T | 掉电走时，数据带时间戳 |
| 存储 | 板载 SD NAND + 内部 FLASH | 数据落盘，参数掉电保持 |
| 调试 | USB CDC 虚拟串口 | Windows 免驱，日志与诊断 |

主要能力：

- 采样率 4k / 8k / 16k / 32k / 64k / 128k / **256k SPS** 可选（默认 32k）
- 采集数据可选 **板载存储本地录制** 与 **网络实时推流**（可独立开关）
- 上位机实时波形预览、录制 WAV（24bit 多通道）
- 4 路数字输入实时推流显示（带边沿计数），只显示不存盘
- 千余条级事件日志、看门狗保护、参数掉电安全保存
- TCP 5000 命令 + 数据流、UDP 5001 自动发现、TFTP（UDP 69）批量文件拷贝
- 上位机中英文一键切换

---

## 2. 技术指标

| 项目 | 指标 |
|------|------|
| 模拟输入 | 8 × IEPE 通道（CH1–CH8），24bit，同步采样 |
| 采样率 | 4k / 8k / 16k / 32k（默认）/ 64k / 128k / 256k SPS |
| 数据格式 | 24bit 有符号小端，按帧交错 |
| 数字输入 | 4 路（DI1–DI4），光耦隔离，5ms 采样 + 3 次消抖 |
| 网络接口 | 10/100M 以太网（RJ45） |
| 命令/数据端口 | TCP 5000 |
| 发现端口 | UDP 5001（广播） |
| 文件传输 | TFTP 服务端，UDP 69 |
| 数据存储 | 板载 SD NAND 存储芯片（PCBA 集成，非可插拔 SD 卡），FAT32，目录 `/DAQ205/DATA` |
| 参数存储 | 内部 FLASH 日志式追加，掉电保持 |
| RTC | PCF8563T，Unix 时间，UTC 内部时制 |
| 上位机 | Windows 免安装单文件 `DAQ205_Host.exe` |
| 调试接口 | USB CDC 虚拟串口（OTG_FS，PA11/PA12） |
| 可靠性 | 外部看门狗 1Hz 喂狗；环形缓冲吸收 SD/网络抖动 |

> 上电、接线、供电极性等电气参数请以整机丝印与硬件设计文件为准。

---

## 3. 硬件说明

### 3.1 接口一览

| 接口 | 功能 |
|------|------|
| CH1–CH8 输入端子 | IEPE 模拟通道，接振动 / 声学传感器 |
| DI1–DI4 输入端子 | 数字量输入（光耦，低电平有效） |
| RJ45 | 以太网，10/100M 自适应 |
| 板载 SD NAND | PCBA 集成存储芯片（非可插拔），录制数据存储 |
| USB 口 | 调试日志 / 诊断命令（CDC 虚拟串口） |
| 按键 KEY | 短按启停采集；长按 5s 恢复出厂 |
| LED | STATUS 状态灯 ×1 + PWR 电源指示灯 ×1 + 通道灯 CH1–CH8 ×8 + 存储报警灯 ×1 + 网络指示灯 ×1 |

### 3.2 指示灯定义

**STATUS（状态灯）**

| 状态 | 表现 |
|------|------|
| 系统正常运行 | 心跳闪烁（只要上电就闪） |
| 恢复出厂进行中 | 快闪提示 |
| 存在故障 | 按故障码闪烁 N 次 + 停顿循环（N = 故障码） |

**PWR（电源指示灯）**

| 状态 | 表现 |
|------|------|
| 供电正常 | 常亮 |

**通道灯 CH1–CH8（模拟通道）**

| 灯 | 含义 |
|----|------|
| CH1–CH8 | 采集中点亮已使能的模拟通道 |

**存储报警灯 CH9**

| 状态 | 表现 |
|------|------|
| 平时 | 跟随 DI1 电平 |
| 存储剩余空间 <10MB | 快闪提醒（覆盖 DI1 显示），请尽快拷贝数据并清理 |

**网络指示灯 CH10**

| 状态 | 表现 |
|------|------|
| 平时 | 跟随 DI2 电平 |
| 网线未接 | 快闪（覆盖 DI2 显示） |
| 网络已连接但无上位机 | 熄灭（覆盖 DI2 显示） |
| 上位机已连接 | 常亮（覆盖 DI2 显示） |

> DI3 / DI4 没有对应指示灯，仅通过网络推流在上位机显示。

### 3.3 按键

| 动作 | 效果 |
|------|------|
| 短按（<1s） | 启动 / 停止本地采集（按当前采集参数执行） |
| 长按 5s | **恢复出厂设置**：IP 回到 192.168.66.55，全部配置重置并重启 |

---

## 4. 快速开始

1. **接线**：IEPE 传感器接入 CH1–CH8；网线接入 RJ45。
2. **上电**：PWR 电源灯常亮，STATUS 灯进入心跳；网线正常时网络指示灯不会快闪。
3. **发现设备**：电脑与设备接同一局域网（设备默认
   `192.168.66.55 / 255.255.255.0 / 192.168.66.1`），双击 `DAQ205_Host.exe`，
   点 **发现设备**；也可直接在 IP 框输入 `192.168.66.55` 点 **连接**。
4. **连接成功**：左侧显示设备信息，网络指示灯常亮，状态栏变为“已连接”。
5. **启动采集**：在“采集与录制”页设置通道 / 采样率 / 存卡 / 推流，
   点 **应用采集参数**，再点 **启动采集**；回“设备监控”页可实时预览波形。
6. **录制 WAV**：勾选“录制 WAV”，填写保存路径，点 **开始录制**。

> 同一时刻只支持 **一个** TCP 客户端连接设备。

---

## 5. 上位机软件

### 5.1 运行

免安装，双击工程根目录 `DAQ205_Host.exe`（也可用 `python host/daq205_gui.py`
运行源码，需 Python 3.9+ 带 tkinter，调试终端页另需 `pip install pyserial`）。
右上角 **EN / 中文** 按钮可一键切换全部界面语言（含设备信息内容）。

### 5.2 设备监控（Monitor）

- 设备信息：名称 / 固件版本 / MAC / IP / 端口 / 通道数 / 采样率 / 序列号 / 编译时间
- **启动 / 停止 / 校时 / 刷新状态** 快捷按钮
- 状态行：运行状态 + 故障码 + 数字量位图
- 底部链路行：网络链路、SD 剩余、帧计数、超限、堆内存
- 实时波形：右侧选择 CH1–CH8 任意组合预览
- 数字输入面板：DI1–DI4 电平阶梯图 + 累计边沿数（仅显示，不存盘）

### 5.3 采集与录制（Acquisition）

| 项 | 说明 |
|----|------|
| 启用通道 | 如 `1 2 3`，留空表示全部 8 通道 |
| 采样率 | 4k–256k SPS |
| 采集时长 ms | 0 = 连续，由上位机控制启停 |
| 保存到板载存储 | 采集数据落盘（`.bin` + `.json`） |
| 网络推流 | 数据经 TCP 5000 推给上位机 |
| 录制 WAV | 把推流数据实时写成 24bit WAV（需先填输出路径） |

参数保存到设备内部 FLASH，掉电保持。

### 5.4 文件管理（Files）

- 列出板载存储 `/DAQ205/DATA` 下所有文件（连接后自动刷新）
- **拷贝到电脑 / 全部拷贝**：默认走 TFTP（快），可切 TCP 命令通道；
  勾选“拷贝后自动转成 WAV”可把 `.bin` 直接转为 `.wav`
- **上传到存储**：走 TFTP
- **删除选中**：走 TCP 命令通道，支持多选（采集中拒绝删除）
- 采集 / 录制进行中文件列表不可用（避免抢存储总线）

### 5.5 网络设置（Network）

- 修改 IP / 掩码 / 网关 / TCP 端口，点 **应用** 立即生效并掉电保存，
  之后需用新地址重连
- **恢复出厂设置**：IP 回到 192.168.66.55，所有配置重置
- **重启设备**

### 5.6 调试终端（Console）

- 用 USB 线连接设备 OTG_FS 口（虚拟 COM 口），在页内选择串口点 **打开串口**
- 即可交互输入固件调试命令（`help` / `ver` / `sd` / `rtc` / `nv` / `adcreg` /
  `tftp` / `phy` …），支持回显、退格与上下键历史命令，不依赖第三方串口工具
- 调试终端与网络连接相互独立；需要 Python 环境 `pyserial`（exe 已内置）

### 5.7 命令行工具（脚本 / 自动化）

```bash
python host/daq205_tool.py discover                      # 广播发现
python host/daq205_tool.py info    --ip 192.168.66.55    # 设备信息
python host/daq205_tool.py status  --ip 192.168.66.55    # 运行状态
python host/daq205_tool.py set-acq --ip 192.168.66.55 --mask 0xFF --odr-index 3 --duration-ms 5000
python host/daq205_tool.py set-net --ip 192.168.66.55 --new-ip 192.168.66.60
python host/daq205_tool.py record  --ip 192.168.66.55 -o a.wav --duration 5
python host/daq205_tool.py preview --ip 192.168.66.55 --channels 0 1 2
python host/daq205_tool.py list    --ip 192.168.66.55
python host/daq205_tool.py tftp-get --ip 192.168.66.55 --name xxx.bin -o xxx.bin
python host/daq205_tool.py tftp-put --ip 192.168.66.55 --file local.bin
python host/daq205_tool.py wav      --file xxx.bin -o xxx.wav
```

---

## 6. 数据文件格式

板载存储目录 `/DAQ205/DATA/`，文件名 `<时间戳>_<N>CH_<ODR>sps.bin`。

- **.bin**：52 字节文件头（`rec_header_t`，magic `"D205BIN"`，含通道数、
  通道掩码、标称采样率、起始 Unix 时间、总帧数等）+ 帧交错 24bit 小端采样。
  网络推流的采样区格式与之一致。
- **.json**：停止录制时自动生成的元数据（通道数、采样率、帧数、起止时间等）。
- **.wav**：上位机按 `nchannels = ch_count, sampwidth = 3, framerate = odr`
  转换得到，可直接用任意音频 / 分析软件打开。

详细字节布局见《数据协议说明》（`docs/protocol.md`）。

---

## 7. 时间与 RTC

- 设备内置 PCF8563T 实时时钟，内部一律 **UTC** 存储
- 上位机 **校时** 按钮（SET_TIME）把电脑当前时间写入 RTC
- 录制文件名、`.json`、事件日志、推流时间戳均基于 RTC
- RTC 掉电 / 通信异常会上报 `FAULT_RTC (10)`，此时时间戳不可信，建议先校时

---

## 8. 参数存储与恢复出厂

- 全部参数（网络 / 采集）保存在 STM32 内部 FLASH，**日志式追加 + CRC32 校验**，
  掉电安全；每次修改立即保存
- 恢复出厂（上位机按钮或长按按键 5s）会擦除参数扇区并写回默认值：
  `192.168.66.55 / 255.255.255.0 / 192.168.66.1`，TCP 5000，
  8 通道全开、32kSPS、连续采集、存卡 + 推流

---

## 9. 故障码

| 码 | 名称 | 含义 |
|---:|------|------|
| 0 | 无故障 | — |
| 1 | SD_MISSING | 存储器未就绪 |
| 2 | SD_IO | 存储器读写错误 |
| 3 | ADC_NO_DATA | AD7768 无数据输出（时钟 / 复位异常） |
| 4 | ADC_CFG | AD7768 配置回读校验失败 |
| 5 | 保留码 | （历史参数存储损坏） |
| 6 | ETH_LINK | 网线未连接（网络指示灯快闪表达） |
| 7 | OVERRUN | 采集数据溢出（处理不及时） |
| 8 | OVERTEMP | 温度过高 |
| 9 | 保留码 | （历史外部 NOR 错误） |
| 10 | RTC | RTC 掉电 / 通信异常 |

故障时 STATUS 灯按“闪 N 次 + 停顿”循环提示（N = 故障码），
上位机状态行同步显示。

---

## 10. USB CDC 调试命令

USB 线连接后出现虚拟 COM 口（波特率任意），输入命令 + 回车。
可在**上位机“调试终端”页**直接交互（支持回显 / 退格 / 历史），也可用
任意串口工具：

| 命令 | 作用 |
|------|------|
| `help` | 帮助 |
| `ver` | 固件版本与编译时间 |
| `sd` | 存储器挂载与容量 |
| `acq` | ADC / 采集运行状态 |
| `adcreg` | AD7768 关键寄存器 |
| `scan` | 扫描 MDIO 总线全部 PHY 地址 |
| `phy` | PHY 寄存器与链路状态 |
| `eth` | ETH MAC/DMA 寄存器与收发统计 |
| `tftp` | TFTP 传输统计 |
| `nv` | 参数存储（槽位 / 写入次数） |
| `rtc` | RTC 时间 |
| `trace` | 采集轨迹 |

---

## 11. 常见问题（FAQ）

**Q：发现设备列表为空？**
检查网线与网络指示灯（未接网线会快闪）；设备与电脑须在同一网段；
也可直接输入 IP 连接。

**Q：改完 IP 连不上了？**
设备应用网络参数后立即切换 IP，需用新地址重连。忘记 IP 可长按按键 5s
恢复出厂（回到 192.168.66.55）。

**Q：文件列表 / 文件操作报 busy？**
采集或录制进行中禁止文件操作，先停止采集。

**Q：推流出现丢块（flags bit0 或 OVERRUN）？**
建议 100M 全双工链路；降低采样率或减少推流通道；检查电脑性能。
**256kSPS × 8 通道**的推流约 6.2 MB/s（占百兆链路一半以上），此时建议：
**"保存到板载存储"与"网络推流"二选一**，同时勾选两者容易触发 OVERRUN；
上位机需要 numpy（`pip install numpy`）以获得流畅预览（exe 已内置）。
OVERRUN 故障码为瞬态提示：仅当最近 2 秒内仍在丢块才显示，偶发抖动会自动消失。

**Q：录制时间对不上？**
RTC 未校时。连接后点“校时”再录制。

**Q：存储报警灯快闪？**
存储剩余空间不足 10MB，请尽快拷贝数据并清理。

---

## 12. 注意事项

1. 同一时刻仅支持一个 TCP 客户端。
2. 实时预览与录制 WAV 共用同一条推流，二者不能同时进行。
3. 采集 / 录制进行中请勿断电或复位（存储写入中）。
4. 事件日志保存在 RAM 中（256 条），**断电不保存**；如需保留请在上位机读取。
5. 建议使用 100M 全双工网络；10M 半双工高采样率下可能丢块。

[下载中文 PDF 正式版（V1.5）→](/assets/docs/octet-daq205-user-manual-v1.5-zh.pdf)

</div>
