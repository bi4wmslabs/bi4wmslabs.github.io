---
title: "LoRa Flood Sensor Development Series - Part 2 Schematic Design and Component Selection"
title_zh: "LoRa 水浸传感器开发系列（二）：原理图设计与器件选型"
excerpt: "Building a reliable ultra-low-power water leak detector around the STM32G030K8T6 and a LoRa transceiver."
excerpt_zh: "围绕 STM32G030K8T6 与 LoRa 收发器，搭出可靠的超低功耗水浸检测节点原理图。"
date: 2026-05-16 06:10:10 +0800
categories: [projects, lora]
tags: [lora, arduino, kicad, stm32g030, iot]
permalink: /posts/lora-flood-02-schematic-and-parts/
image: /assets/img/lora-part2.png
series: "LoRa Flood Sensor"
series_no: 2
series_total: 3
---

<span data-zh-title="LoRa 水浸传感器开发系列（二）：原理图设计与器件选型" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">LoRa Flood Sensor Development Series</p>
  <p class="bi-series-nav">Design &amp; build notes · Part 2 of 3 · <a href="/posts/lora-flood-01-system-solution/">&larr; Prev</a> · <a href="/posts/lora-flood-03-pcb-placement/">Next &rarr;</a></p>
</div>

Building a reliable, ultra-low-power water leak/immersion detector with LoRa connectivity? This project uses the **STM32G030K8T6** MCU and **SX1278** LoRa module for excellent Arduino compatibility, long-range transmission, and minimal power consumption.

In this guide, we share the full hardware design using the simplest electrode resistance principle for water detection, plus a reserved capacitive sensing option for future upgrades.

---

## Project Overview

**Core Detection Method**: Simple electrode resistance sensing (two electrodes shorted by water).  
**MCU**: STM32G030K8T6 (familiar, well-supported, Arduino-friendly).  
**Wireless**: SX1278 LoRa module (better Arduino ecosystem support than LLCC68).  
**Power**: CR2450 coin cell with large bulk capacitors for LoRa transmission peaks.  
**Programming**: UART bootloader (no SWD required during normal use).

---

## MCU Minimum System Schematic

### Key Features & Connections

- **MCU**: STM32G030K8T6
- **LoRa Interface**: Full SPI connection
- **Programming/Debug**: UART bootloader + serial debugging (simplifies layout by removing SWD)
- **Battery Voltage Monitoring**: Sampled only when **PA13** is driven low (power-saving strategy)
- **Heartbeat LED**: **PB3** drives a status indicator LED
- **Reset Circuit**: Simple RC reset network
- **BOOT0**: Switch for easy bootloader entry during firmware flashing
- **Water Detection**: **PA0** (electrode input, configured as input with internal pull-up)
- **Capacitive Sensing Reserve**: **PB0** and **PB1** pre-wired for future capacitive method evaluation

This minimal system keeps the design compact and low-cost while maintaining flexibility.

<img width="865" height="629" alt="image" src="https://github.com/user-attachments/assets/f2a94e45-2176-47e7-b2b5-6ee8f2dc63e1" />


---

## LoRa RF Module Circuit

We chose the **SX1278** over LLCC68 for superior Arduino library support and easier development.
<img width="865" height="370" alt="image" src="https://github.com/user-attachments/assets/c7dd21da-c110-4ad0-9f75-29ef482d3a7a" />


**Main Features**:
- Standard SPI interface to MCU
- Additional GPIO line connected to MCU for module control (DIO0/DIO1 etc.)
- PI-type matching network on the antenna for optimal RF performance and easy tuning
- Reference design layout followed for maximum range and stability

---

## Water Immersion Detection Circuit (Electrode Resistance Method)

**Principle**: When water bridges the electrodes, it creates a conductive path that triggers the detection signal.
<img width="865" height="629" alt="image" src="https://github.com/user-attachments/assets/1d6991c1-60fc-4172-aa31-05820c4838b6" />


### Circuit Design
- Uses a **PNP + NPN** transistor combination for efficient switching and low standby current.
- **TP** = Detection electrodes (two pairs implemented — one on the front and one on the back of the enclosure for better coverage).
- When water is present → **Q102** turns on → **Q101** turns on → **WATER_DETECT** signal goes **LOW**.
- **MCU Pin**: Configured as input with **pull-up** enabled. Low level = water detected.

This design is extremely simple, reliable, and consumes almost no power when dry.


---

## Reserved Capacitive Water Detection Circuit (Future Upgrade)

For environments where electrode corrosion or false positives from minerals might be an issue, we pre-reserved a **capacitive sensing** path.

<img width="865" height="398" alt="image" src="https://github.com/user-attachments/assets/f59623e4-063e-45d9-ba68-acddd7b6c607" />


**Principle**: Water’s dielectric constant (~80× higher than air) significantly changes the capacitance between two electrodes.

### Circuit Details
- **TP101 & TP102**: Capacitive sensing electrodes (can be PCB traces or custom plates).
- **PWM_OUT**: MCU-generated PWM signal drives the sensing circuit.
- Peak detector formed by diodes and capacitor converts capacitance change into a DC voltage on **CAP_VOLT**.
- MCU can read **CAP_VOLT** via ADC. Significant voltage shift expected when immersed.

This section remains unpopulated by default but gives the hardware future-proofing.

---

## Power Supply Circuit

**Battery**: CR2450 3V coin cell.  
**Challenge**: LoRa transmission can cause high current peaks that may trigger brown-out resets.

<img width="865" height="351" alt="image" src="https://github.com/user-attachments/assets/ee5b42b9-5bad-40fe-95a9-f726c515fffa" />


**Solution**:
- Three **100µF** electrolytic capacitors in parallel as energy storage.
- This bulk capacitance stabilizes voltage during TX bursts, ensuring reliable long-range LoRa operation.

---

## Next Steps

PCB layout

---

*Perfect for smart home, basement monitoring, industrial leak detection, or agriculture applications. Simple, cheap, and long-range thanks to LoRa.*

---

**Tags**: STM32 IoT, LoRa Water Sensor, DIY Leak Detector, Low Power IoT, Water Immersion Sensor, SX1278, Arduino LoRa Project

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">LoRa 水浸传感器开发系列</p>
  <p class="bi-series-nav">设计与调试实录 · 第 2 篇 / 共 3 篇 · <a href="/posts/lora-flood-01-system-solution/">&larr; 上一篇</a> · <a href="/posts/lora-flood-03-pcb-placement/">下一篇 &rarr;</a></p>
</div>

想打造一台可靠、超低功耗、带 LoRa 连接的水浸检测器？本项目采用 **STM32G030K8T6** MCU 和 **SX1278** LoRa 模块，以获得出色的 Arduino 兼容性、远距离传输能力和极低的功耗。

在本指南中，我们分享完整的硬件设计：用最简单的电极电阻原理实现水浸检测，并预留电容式检测方案以便未来升级。

---

## 项目概述

**核心检测方法**：简单的电极电阻检测（两个电极被水短接）。  
**MCU**：STM32G030K8T6（熟悉、支持完善、对 Arduino 友好）。  
**无线**：SX1278 LoRa 模块（相比 LLCC68 有更好的 Arduino 生态支持）。  
**电源**：CR2450 纽扣电池，配大容量储能电容以应对 LoRa 发射峰值电流。  
**烧录**：UART bootloader（正常使用时无需 SWD）。

---

## MCU 最小系统原理图

### 关键特性与连接

- **MCU**：STM32G030K8T6
- **LoRa 接口**：完整 SPI 连接
- **烧录/调试**：UART bootloader + 串口调试（去掉 SWD 以简化布局）
- **电池电压监测**：仅在 **PA13** 拉低时采样（省电策略）
- **心跳 LED**：**PB3** 驱动状态指示灯 LED
- **复位电路**：简单的 RC 复位网络
- **BOOT0**：用于烧录固件时便捷进入 bootloader 的开关
- **水浸检测**：**PA0**（电极输入，配置为带内部上拉的输入）
- **电容式检测预留**：**PB0** 与 **PB1** 已预先引线，供未来评估电容式方案

该最小系统在保持灵活性的同时，让设计紧凑且低成本。

<img width="865" height="629" alt="image" src="https://github.com/user-attachments/assets/f2a94e45-2176-47e7-b2b5-6ee8f2dc63e1" />


---

## LoRa RF 模块电路

相比 LLCC68，我们选择 **SX1278**，因为它有更优的 Arduino 库支持、开发更简便。
<img width="865" height="370" alt="image" src="https://github.com/user-attachments/assets/c7dd21da-c110-4ad0-9f75-29ef482d3a7a" />


**主要特性**：
- 与 MCU 的标准 SPI 接口
- 额外的 GPIO 线连接到 MCU 用于模块控制（DIO0/DIO1 等）
- 天线端采用 PI 型匹配网络，以获得最佳 RF 性能并便于调试
- 参照参考设计布局，以获得最大通信距离和稳定性

---

## 水浸检测电路（电极电阻法）

**原理**：当水桥接两个电极时，会形成导电通路，从而触发检测信号。
<img width="865" height="629" alt="image" src="https://github.com/user-attachments/assets/1d6991c1-60fc-4172-aa31-05820c4838b6" />


### 电路设计
- 采用 **PNP + NPN** 晶体管组合，实现高效开关与极低的待机电流。
- **TP** = 检测电极（共实现两对——一对在外壳正面、一对在背面，以获得更好的覆盖范围）。
- 有水时 → **Q102** 导通 → **Q101** 导通 → **WATER_DETECT** 信号变为**低电平**。
- **MCU 引脚**：配置为**上拉**输入。低电平即表示检测到水。

该设计极其简单、可靠，且在干燥状态下几乎不耗电。


---

## 预留电容式水浸检测电路（未来升级）

对于可能存在电极腐蚀或矿物质引起误报的环境，我们预先预留了一条**电容式检测**通路。

<img width="865" height="398" alt="image" src="https://github.com/user-attachments/assets/f59623e4-063e-45d9-ba68-acddd7b6c607" />


**原理**：水的介电常数（约为空气的 80 倍）会显著改变两个电极之间的电容。

### 电路细节
- **TP101 与 TP102**：电容式检测电极（可以是 PCB 走线或定制极板）。
- **PWM_OUT**：由 MCU 产生的 PWM 信号驱动检测电路。
- 由二极管和电容构成的峰值检波器，将电容变化转换为 **CAP_VOLT** 上的直流电压。
- MCU 可通过 ADC 读取 **CAP_VOLT**。浸入水中时，预期出现明显的电压变化。

该部分默认不贴装元件，但为硬件预留了未来升级空间。

---

## 电源电路

**电池**：CR2450 3V 纽扣电池。  
**难点**：LoRa 发射会产生较高的电流峰值，可能触发欠压复位。

<img width="865" height="351" alt="image" src="https://github.com/user-attachments/assets/ee5b42b9-5bad-40fe-95a9-f726c515fffa" />


**解决方案**：
- 三个 **100µF** 电解电容并联作为储能。
- 这些大容量电容在 TX 突发发射期间稳定电压，确保远距离 LoRa 通信可靠。

---

## 后续步骤

PCB 布局

---

*非常适合智能家居、地下室监测、工业漏水检测或农业应用。得益于 LoRa，方案简单、廉价且传输距离远。*

---

**标签**：STM32 物联网、LoRa 水浸传感器、DIY 漏水检测器、低功耗物联网、水浸传感器、SX1278、Arduino LoRa 项目

</div>
