---
title: "LoRa Flood Sensor Development Series - Part 1 Water Immersion Sensor System Solution"
title_zh: "LoRa 水浸传感器开发系列（一）：系统方案"
excerpt: "Requirements for a coin-cell wearable water immersion alarm, and why LoRa was chosen for a 500-node, 200 m system."
excerpt_zh: "纽扣电池供电的可穿戴水浸报警器需求拆解，以及 500 节点、200 米系统为什么最终选择 LoRa。"
date: 2026-05-10 06:10:10 +0800
categories: [projects, lora]
tags: [lora, arduino, kicad, stm32g030, iot]
permalink: /posts/lora-flood-01-system-solution/
image: /assets/img/lora-part1.png
series: "LoRa Flood Sensor"
series_no: 1
series_total: 3
---

<span data-zh-title="LoRa 水浸传感器开发系列（一）：系统方案" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">LoRa Flood Sensor Development Series</p>
  <p class="bi-series-nav">Design &amp; build notes · Part 1 of 3 · <a href="/posts/lora-flood-02-schematic-and-parts/">Next &rarr;</a></p>
</div>

Recently, I evaluated a water immersion sensor system solution. Here is a quick summary of the proposed design.

## 1. User Requirements

Design a wearable water immersion alarm device. The key requirements are as follows:

1. The device must be wearable, powered by a coin cell battery, and support standby operation for more than 1 year.
2. In a dry environment, the device remains in standby mode. When water is detected, it immediately transmits an RF signal and reports a unique identity code to the platform system.
3. The system must support a capacity of **500 devices**.
4. Communication range must exceed **200 meters**.

## 2. System Solution

With coin cell battery power and a standby time of over 1 year, **ultra-low power consumption** is the top priority. At the same time, supporting 500 devices makes ordinary RF solutions difficult to implement reliably. We need a protocol stack that supports reliable addressing, collision avoidance, retransmission, and acknowledgments.

After evaluation, the **LoRa system solution** is the most suitable choice.

- **Node Device Side**: Use a mature LoRa chipset such as **SX1278 + low-power MCU**.
- **Water Detection**: Adopt the proven resistance-based detection method, with special attention to electrode anti-corrosion design.

I have become proficient with KiCad recently. After selecting a suitable off-the-shelf enclosure, I completed the PCB layout design to fit inside the shell.
<img width="864" height="598" alt="image" src="https://github.com/user-attachments/assets/22104844-4a88-4dfb-a1c1-d4c084b22d4c" />


**3D PCBA Appearance**

<img width="864" height="533" alt="image" src="https://github.com/user-attachments/assets/c23b50c9-2547-41a9-93eb-cfb0a381cdaf" />


I then fed the 3D PCBA images, enclosure photos, and key product information into an AI tool to generate a promotional color flyer for the node device.

<img width="864" height="577" alt="image" src="https://github.com/user-attachments/assets/fb5f49f0-4823-4daa-a1d1-7cbe2426670d" />


**System Platform Architecture**

The platform adopts a **LoRa Gateway + PC Platform** solution. The LoRa gateway communicates with the PC system via wired or wireless networks. I also used AI to generate the overall system design block diagram.

<img width="865" height="475" alt="image" src="https://github.com/user-attachments/assets/374e7bd4-8abd-4917-b71a-9fe77a28c630" />

---

**Next Article**: Schematic design – stay tuned!

---

*Technical Blog Post – Water Immersion Sensor Project*

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">LoRa 水浸传感器开发系列</p>
  <p class="bi-series-nav">设计与调试实录 · 第 1 篇 / 共 3 篇 · <a href="/posts/lora-flood-02-schematic-and-parts/">下一篇 &rarr;</a></p>
</div>

最近，我评估了一套水浸传感器系统方案。这里简要总结一下拟定的设计。

## 1. 用户需求

设计一款可穿戴的水浸报警设备。关键需求如下：

1. 设备须可穿戴，采用纽扣电池供电，并支持待机运行 1 年以上。
2. 在干燥环境中，设备保持待机模式；一旦检测到水，立即发射 RF 信号，并向平台系统上报唯一身份码。
3. 系统须支持 **500 台设备**的容量。
4. 通信距离须超过 **200 米**。

## 2. 系统方案

在纽扣电池供电、待机时间超过 1 年的条件下，**超低功耗**是首要考量。同时，支持 500 台设备让普通 RF 方案难以可靠实现。我们需要一套支持可靠寻址、冲突避免、重传与应答的协议栈。

经过评估，**LoRa 系统方案**是最合适的选择。

- **节点设备端**：采用成熟的 LoRa 芯片方案，例如 **SX1278 + 低功耗 MCU**。
- **水浸检测**：采用经过验证的基于电阻的检测方法，并特别注意电极防腐蚀设计。

最近我已熟练掌握了 KiCad。在选定一款合适的现成外壳后，我完成了适配该外壳内部空间的 PCB 布局设计。
<img width="864" height="598" alt="image" src="https://github.com/user-attachments/assets/22104844-4a88-4dfb-a1c1-d4c084b22d4c" />


**3D PCBA 外观**

<img width="864" height="533" alt="image" src="https://github.com/user-attachments/assets/c23b50c9-2547-41a9-93eb-cfb0a381cdaf" />


随后，我把 3D PCBA 图片、外壳照片和关键产品信息输入 AI 工具，生成了节点设备的宣传彩页。

<img width="864" height="577" alt="image" src="https://github.com/user-attachments/assets/fb5f49f0-4823-4daa-a1d1-7cbe2426670d" />


**系统平台架构**

平台采用 **LoRa 网关 + PC 平台**方案。LoRa 网关通过有线或无线网络与 PC 系统通信。我还借助 AI 生成了整体系统设计框图。

<img width="865" height="475" alt="image" src="https://github.com/user-attachments/assets/374e7bd4-8abd-4917-b71a-9fe77a28c630" />

---

**下一篇**：原理图设计，敬请期待！

---

*技术博客文章 – 水浸传感器项目*

</div>
