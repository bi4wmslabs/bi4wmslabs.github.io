---
title: "OCTET — 8-Channel IEPE Vibration DAQ"
title_zh: "OCTET 八通道 IEPE 振动采集器"
short_name: "OCTET"
short_name_zh: "OCTET 采集器"
category: "Test & Measurement"
category_zh: "振动数据采集"
date: 2026-11-12
featured: true
pinned: true
image: "/assets/images/projects/octet-daq.jpg"
excerpt: "A compact 8-channel IEPE vibration DAQ: 24-bit simultaneous sampling up to 256 kSPS, onboard SD NAND recording and 100M Ethernet streaming."
excerpt_zh: "8 通道 IEPE 振动采集器：24bit 同步采样最高 256 kSPS，板载 SD NAND 录制与百兆以太网实时流式输出。"
---

<!-- 页面大标题的中文（放在正文第一行，不会显示） -->
<span data-zh-title="OCTET 八通道 IEPE 振动采集器" hidden></span>

<!-- ↓↓↓ 英文正文 ↓↓↓ 哨兵 span 必须保留在块内第一行 ↓↓↓ -->
<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

## Overview

**OCTET** (*Octal-Channel Transducer & Event Telemetry*, internal model **DAQ205**) is a compact data acquisition unit built for condition monitoring of rotating machinery — fans, pumps, motors and spindles. It sits next to the machine, digitises eight IEPE accelerometers simultaneously, and either streams the data to a PC over 100M Ethernet or records it to onboard storage on its own.

The full engineering story, from frozen requirements to product release, is published as the [five-part OCTET series](/octet-series/).

## Specifications

| Item | Value |
| --- | --- |
| Analog input | 8 IEPE channels, 24-bit simultaneous sampling |
| Sample rates | 4k / 8k / 16k / 32k / 64k / 128k / 256k SPS per channel |
| Digital input | 4 DI channels with timestamps and accumulated edge counters |
| Local recording | Soldered SD NAND, FAT32 file system |
| Streaming | 100M Ethernet, TCP real-time streaming with live waveform preview |
| Management | UDP discovery, persistent parameters, factory reset, remote reboot |
| File access | List / download / upload / delete over TFTP and TCP |
| Clock | Battery-backed RTC, host time sync, timestamped file names |
| Field debug | USB CDC command line |

## Hardware and firmware highlights

- **STM32H753VIT6** — 480 MHz Cortex-M7 with 1 MB RAM and dual-bank FLASH used for parameter storage.
- **AD7768BSTZ** — 8-channel 24-bit simultaneous Σ-Δ ADC. Its data port connects directly to the MCU's SAI peripheral as a slave DMA receiver; two DOUT lines carry all eight channels at near-zero CPU cost.
- **RTL8201FI** 10/100M MII PHY, **PCF8563T** battery-backed RTC, and soldered SD NAND instead of a removable card slot for vibration robustness.
- Recording and streaming are designed to be used one at a time: 256 kSPS × 8 channels is about 6.2 MB/s, over half of a 100M link.
- A fixed-header binary protocol with CRC32, plus UDP discovery, TFTP bulk transfer and a dedicated host reader thread, makes third-party integration practical.

## Design & debugging notes

1. [Requirements and System Design](/posts/octet-01-requirements/)
2. [Functional Decomposition and Software Architecture](/posts/octet-02-architecture/)
3. [Ten Rounds of USB CDC Enumeration Debugging](/posts/octet-03-usb-enumeration/)
4. [Off-Frame SPI, SD Overruns and the 256 kSPS Battle](/posts/octet-04-debugging-adc-sd/)
5. [Protocol Design, Host Software and Product Release](/posts/octet-05-protocol-and-product/)

## Status

The design and debugging notes above are published in full. Add the schematic, PCB files, BOM, firmware release and calibration procedure here once they are ready for distribution; until then, only validated figures from the notes are quoted on this page.

</div>

<!-- ↓↓↓ 中文正文 ↓↓↓ -->
<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

## 概述

**OCTET**（*Octal-Channel Transducer & Event Telemetry*，内部型号 **DAQ205**）是一台面向旋转设备状态监测的紧凑型数据采集器，适用于风机、水泵、电机与主轴。设备就近安装在机器旁，对 8 路 IEPE 加速度传感器同步采样，既可以通过百兆以太网把数据实时流传到上位机，也可以脱离电脑独立录制到板载存储器。

从指标冻结到产品化交付的完整过程，已整理为 [OCTET 设计与调试实录系列](/octet-series/)（共 5 篇）。

## 规格

| 项目 | 数值 |
| --- | --- |
| 模拟输入 | 8 通道 IEPE，24bit 同步采样 |
| 采样率 | 单通道 4k / 8k / 16k / 32k / 64k / 128k / 256k SPS |
| 数字输入 | 4 路 DI，带时间戳与累计边沿计数 |
| 本地录制 | 板贴 SD NAND，FAT32 文件系统 |
| 实时流式 | 百兆以太网 TCP 实时传输，上位机波形预览 |
| 设备管理 | UDP 发现、参数掉电保存、恢复出厂、远程重启 |
| 文件访问 | 列表 / 下载 / 上传 / 删除（TFTP 与 TCP 双通道） |
| 时钟 | 电池备份 RTC、上位机对时、文件名带时间戳 |
| 现场调试 | USB 虚拟串口命令行 |

## 硬件与固件要点

- **STM32H753VIT6**：480 MHz Cortex-M7，1 MB RAM，双 Bank FLASH 用于保存参数。
- **AD7768BSTZ**：8 通道 24bit 同步 Σ-Δ ADC。数据口直接接到 MCU 的 SAI 从机 DMA 接收端，两路 DOUT 以极低 CPU 开销承载全部 8 个通道。
- **RTL8201FI** 10/100M MII PHY、**PCF8563T** 电池备份 RTC；存储采用板贴 SD NAND 而非可插拔卡槽，抗振动更可靠。
- 录制与流式输出设计为二选一：256 kSPS × 8 通道约 6.2 MB/s，已超过百兆链路的一半带宽。
- 定长帧头 + CRC32 的二进制协议，配合 UDP 发现、TFTP 批量传输与上位机专用读线程，便于第三方集成。

## 设计与调试实录

1. [需求分析与总体方案](/posts/octet-01-requirements/)
2. [功能分解与软件架构](/posts/octet-02-architecture/)
3. [USB 虚拟串口的十轮攻防](/posts/octet-03-usb-enumeration/)
4. [离帧协议、RX_OVERRUN 与 256 kSPS 攻坚](/posts/octet-04-debugging-adc-sd/)
5. [通信协议、上位机与产品化交付](/posts/octet-05-protocol-and-product/)

## 当前状态

上述设计与调试笔记已完整公开。原理图、PCB、BOM、固件发布包与校准流程待整理完成后补充到本页；在此之前，本页只引用笔记中已经验证过的数据。

</div>
