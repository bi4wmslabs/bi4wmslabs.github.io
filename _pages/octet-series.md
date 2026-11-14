---
title: "OCTET Series: Design & Debugging Notes"
title_zh: "OCTET（DAQ001）设计与调试实录系列"
permalink: /octet-series/
layout: single
---

<span data-zh-title="OCTET（DAQ001）设计与调试实录" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

The complete story of **OCTET** (internal model DAQ001), an 8-channel IEPE 24-bit industrial vibration DAQ — from requirements to release, in seven parts — the last two are the formal release documents.

1. **[Requirements and System Design](/posts/octet-01-requirements/)** — freezing specs, part selection, three decisions that saved us later.
2. **[Functional Decomposition and Software Architecture](/posts/octet-02-architecture/)** — data/control-flow split, tasks, ring buffers, the firmware black box.
3. **[Ten Rounds of USB CDC Enumeration Debugging](/posts/octet-03-usb-enumeration/)** — a missing PLL output-enable bit, EP0 skipped, cold-plug PHY power, a leaking BASEPRI.
4. **[Off-Frame SPI, SD Overruns and the 256 kSPS Battle](/posts/octet-04-debugging-adc-sd/)** — off-frame SPI, a 1-DCLK offset, IDMA, an 8 KB stack overflow, and a frame-hungry host.
5. **[Protocol Design, Host Software and Product Release](/posts/octet-05-protocol-and-product/)** — a binary protocol for third parties, reader-thread architecture, and the productization checklist.
6. **[DAQ001 User Manual (V1.5)](/posts/octet-06-user-manual/)** — connectors, indicators, host software, recording file formats, fault codes and FAQ.
7. **[Communication Protocol and Data Format (V1.4)](/posts/octet-07-protocol-spec/)** — frame layout, command set, data/event frames, file transfer and UDP discovery for third-party clients.

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

**OCTET**（内部型号 DAQ001）是一台 8 通道 IEPE 24bit 工业振动数据采集器。这个系列记录它从需求到发布的完整过程，共 7 篇，其中第 6、7 篇为正式交付文档。

1. **[需求分析与总体方案](/posts/octet-01-requirements/)** —— 指标冻结、器件选型、三个在后期救了我们的需求决策。
2. **[功能分解与软件架构](/posts/octet-02-architecture/)** —— 数据流/控制流拆解、任务划分、环形缓冲与固件黑匣子。
3. **[USB 虚拟串口的十轮攻防](/posts/octet-03-usb-enumeration/)** —— PLL 输出使能位缺失、EP0 被跳过、冷插拔 PHY 供电与 BASEPRI 泄漏。
4. **[离帧协议、RX_OVERRUN 与 256 kSPS 攻坚](/posts/octet-04-debugging-adc-sd/)** —— 离帧 SPI、1 个 DCLK 偏移、IDMA、8KB 栈溢出与吃帧的上位机。
5. **[通信协议、上位机与产品化交付](/posts/octet-05-protocol-and-product/)** —— 为第三方集成而设计的协议、专用读线程架构与产品化收尾清单。
6. **[DAQ001 使用说明书 V1.5](/posts/octet-06-user-manual/)** —— 接口与指示灯、上位机各功能页、录制文件格式、故障码与常见问题。
7. **[通信协议与数据格式说明 V1.4](/posts/octet-07-protocol-spec/)** —— 帧结构、命令集、数据/事件帧、文件通道与 UDP 发现，面向第三方开发。

</div>
