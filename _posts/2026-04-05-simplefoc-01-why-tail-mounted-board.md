---
title: "SimpleFOC Integrated Board from Zero to One - Part 1"
title_zh: "SimpleFOC 一体板从零到一（一）：为什么需要尾置一体板"
excerpt: "Why a tail-mounted integrated BLDC driver board, what it has to fit, and how the from-zero-to-one series is planned."
excerpt_zh: "为什么做一块尾置的无刷电机驱动一体板、它要满足哪些约束，以及这个从零到一系列的整体规划。"
date: 2026-04-05 10:10:10 +0800
categories: [projects, simplefoc]
tags: [simplefoc, arduino, altium, stm32f103cbt6, brushless-motor]
permalink: /posts/simplefoc-01-why-tail-mounted-board/
image: /assets/img/simplefoc-block.png
series: "SimpleFOC Integrated Board"
series_no: 1
series_total: 4
---

<span data-zh-title="SimpleFOC 一体板从零到一（一）：为什么需要尾置一体板" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">SimpleFOC Integrated Board · From Zero to One</p>
  <p class="bi-series-nav">Design &amp; build notes · Part 1 of 4 · <a href="/posts/simplefoc-02-schematic-to-pcb/">Next &rarr;</a></p>
</div>

## Why Do We Need a Tail-Mounted SimpleFOC Integrated Board?

As the title suggests, this is a **from-zero-to-one series** covering hands-on learning, design, debugging, and practical insights. The series walks through:

* Hardware design fundamentals
* Software and hardware environment setup
* Getting the motor spinning
* Applying it to real-world projects

This is a record of my journey learning **SimpleFOC**, aimed at helping beginners quickly understand, design, and build their own motor control boards and applications.

---

## Final Result Preview

* Mounted on a **4010 brushless motor**
 <img width="865" height="417" alt="image" src="https://github.com/user-attachments/assets/910bd015-2a9b-43ad-90d2-f90838f4ee7e" />


* Mounted on a **2204 brushless motor**
 <img width="865" height="314" alt="image" src="https://github.com/user-attachments/assets/4f2d9b40-72d5-4333-b6d0-72097d29928a" />


* Control demo **video**


 [![Demo Video](https://img.youtube.com/vi/-CYr3gOOTzE/0.jpg)](https://youtube.com/shorts/-CYr3gOOTzE)

---

## 1. What is SimpleFOC?

**SimpleFOC (Simple Field Oriented Control)** is a popular open-source project that makes it easy to implement **Field Oriented Control (FOC)** for brushless motors.

Compared to traditional trapezoidal (square wave) control, FOC offers:

* Smoother and quieter operation
* Higher torque output
* Better efficiency

It is widely used in applications such as:

* Robotics
* Gimbals
* Self-balancing vehicles

For many makers, SimpleFOC is often the first step into advanced motor control.

Compared to other open-source FOC platforms like VESC or ODrive, **SimpleFOC is more beginner-friendly**, mainly because:

* It provides a simple and intuitive **Arduino library**
* It leverages the rich Arduino ecosystem
* It significantly lowers the barrier to entry

With just basic programming knowledge, users can quickly implement:

* Velocity control
* Position control
* Torque control

---

## 2. Limitations of Official SimpleFOC Development Boards

The official SimpleFOC boards (such as the Shield and Mini) are great for learning and prototyping. They are affordable, open-source, and easy to use.

However, when transitioning from experimentation to real-world applications, several issues become apparent:

* **Large size and lack of compactness**
* **Difficult to mount directly on motors**, requiring many jumper wires
* **Messy wiring**, which is prone to loosening and instability
* **Closed-loop control is cumbersome**, often requiring external encoders and manual alignment
* **Low integration**, leading to complex assembly and debugging

These limitations can be frustrating, especially for beginners trying to build compact and reliable systems.

---

## 3. Why Design a Tail-Mounted SimpleFOC Integrated Board?

To address these pain points, I designed a **compact, highly integrated SimpleFOC control board** that can be mounted directly on the motor.

This board is specifically created for beginners and makers who want a **clean, compact, and practical solution**.

### Key Features

#### 🔧 Direct Motor Mounting

* Slot-based PCB design
* Compatible with **2204–4010 brushless motors**
* Can be mounted directly on the motor base
* Adds almost no extra volume

#### 🧲 Onboard Magnetic Encoder

* Sensor placed at the center of the PCB
* Perfectly aligned with motors using magnetic rings
* For motors without a magnet: simply attach a small magnet to the shaft
* Enables **high-precision closed-loop control** with minimal setup

#### 🔌 USB Type-C Interface

* Built-in USB-to-serial chip
* One Type-C cable for:

  * Firmware upload
  * Parameter tuning
  * Real-time debugging

#### 🔗 Flexible Expansion

* Independent UART control
* External I2C sensors
* Support for ABZ encoders

#### ⚡ Complete Hardware Integration

* Built-in current sensing resistors
* **DRV8313 motor driver** onboard
* Supports current loop control
* Suitable for small to medium power motors

#### 🧠 Main Controller

* **STM32F103CBT6 microcontroller**
* Rich peripherals and widely supported

#### 📐 Physical Specs

* 42mm × 42mm circular PCB
* 4-layer PCB design

#### 🌐 Fully Open Source

* Hardware and software fully open
* Includes:

  * Altium design files
  * Manufacturing (PCBA) files
  * Arduino-based reference firmware

---

## 4. Summary

With this integrated board, you no longer need to worry about:

* Complex wiring
* Mounting difficulties
* Tedious setup procedures

Simply:

1. Mount the board
2. Attach a magnet (if needed)
3. Connect power

…and you can immediately start working with **SimpleFOC**.

This makes it especially suitable for anyone looking to build **compact, clean, and high-performance motor control systems**.

---

## What’s Next?

In the next article, we’ll dive deep into the **hardware design details** of this board, including:

* Schematic analysis
* Component selection
* PCB layout design

Stay tuned!

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">SimpleFOC 一体板 · 从零到一</p>
  <p class="bi-series-nav">设计与调试实录 · 第 1 篇 / 共 4 篇 · <a href="/posts/simplefoc-02-schematic-to-pcb/">下一篇 &rarr;</a></p>
</div>

## 为什么需要尾置 SimpleFOC 一体板？

正如标题所示，这是一个**从零到一的系列**，涵盖动手实践、设计、调试以及实战经验。本系列将依次介绍：

* 硬件设计基础
* 软硬件环境搭建
* 让电机转起来
* 应用到实际项目中

这是我学习 **SimpleFOC** 过程的记录，旨在帮助初学者快速理解、设计并搭建出自己的电机控制板和应用。

---

## 最终效果预览

* 安装在 **4010 无刷电机** 上
 <img width="865" height="417" alt="image" src="https://github.com/user-attachments/assets/910bd015-2a9b-43ad-90d2-f90838f4ee7e" />


* 安装在 **2204 无刷电机** 上
 <img width="865" height="314" alt="image" src="https://github.com/user-attachments/assets/4f2d9b40-72d5-4333-b6d0-72097d29928a" />


* 控制演示 **视频**


 [![演示视频](https://img.youtube.com/vi/-CYr3gOOTzE/0.jpg)](https://youtube.com/shorts/-CYr3gOOTzE)

---

## 1. 什么是 SimpleFOC？

**SimpleFOC（Simple Field Oriented Control）** 是一个广受欢迎的开源项目，让无刷电机的 **磁场定向控制（FOC）** 变得易于实现。

与传统的梯形（方波）控制相比，FOC 具有：

* 运行更平滑、更安静
* 更高的转矩输出
* 更高的效率

它广泛应用于以下场景：

* 机器人
* 云台
* 自平衡车

对许多创客来说，SimpleFOC 往往是迈入高级电机控制的第一步。

与 VESC、ODrive 等其它开源 FOC 平台相比，**SimpleFOC 对初学者更友好**，主要原因在于：

* 提供了简洁直观的 **Arduino 库**
* 充分利用丰富的 Arduino 生态
* 显著降低了入门门槛

只需具备基础编程知识，用户就能快速实现：

* 速度控制
* 位置控制
* 转矩控制

---

## 2. 官方 SimpleFOC 开发板的局限

官方 SimpleFOC 开发板（如 Shield 和 Mini）非常适合学习和原型验证，价格实惠、开源、易用。

然而，从实验阶段走向实际应用时，一些问题便显现出来：

* **体积大、不够紧凑**
* **难以直接安装在电机上**，需要大量跳线
* **布线杂乱**，容易松动、不稳定
* **闭环控制繁琐**，往往需要外接编码器并手动校准
* **集成度低**，装配和调试复杂

这些局限令人头疼，尤其是对于想构建紧凑、可靠系统的初学者。

---

## 3. 为什么要设计一块尾置 SimpleFOC 一体板？

为解决这些痛点，我设计了一块 **紧凑、高集成度的 SimpleFOC 控制板**，可直接安装在电机上。

这块板专为想要 **干净、紧凑、实用方案** 的初学者和创客打造。

### 核心特性

#### 🔧 直接安装到电机

* 采用开槽式 PCB 设计
* 兼容 **2204–4010 无刷电机**
* 可直接安装在电机底座上
* 几乎不增加额外体积

#### 🧲 板载磁编码器

* 传感器置于 PCB 中心
* 与使用磁环的电机完美对中
* 对于不带磁铁的电机：只需在转轴上贴一小块磁铁
* 以最少的配置实现 **高精度闭环控制**

#### 🔌 USB Type-C 接口

* 内置 USB 转串口芯片
* 一根 Type-C 线缆即可完成：

  * 固件烧录
  * 参数整定
  * 实时调试

#### 🔗 灵活扩展

* 独立的 UART 控制
* 外接 I2C 传感器
* 支持 ABZ 编码器

#### ⚡ 完整的硬件集成

* 内置电流采样电阻
* 板载 **DRV8313 电机驱动**
* 支持电流环控制
* 适用于中小功率电机

#### 🧠 主控制器

* **STM32F103CBT6 微控制器**
* 外设丰富、生态支持广泛

#### 📐 物理规格

* 42mm × 42mm 圆形 PCB
* 4 层 PCB 设计

#### 🌐 完全开源

* 硬件与软件全部开放
* 包含：

  * Altium 设计文件
  * 生产（PCBA）文件
  * 基于 Arduino 的参考固件

---

## 4. 总结

有了这块一体板，你不再需要为以下问题操心：

* 复杂的布线
* 安装困难
* 繁琐的配置流程

只需：

1. 装上板子
2. 贴一块磁铁（如需要）
3. 接通电源

……就能立即开始使用 **SimpleFOC**。

这让它尤其适合想要构建 **紧凑、干净、高性能电机控制系统** 的人。

---

## 后续内容

下一篇文章，我们将深入这块板的 **硬件设计细节**，包括：

* 原理图分析
* 器件选型
* PCB 布局设计

敬请期待！

</div>
