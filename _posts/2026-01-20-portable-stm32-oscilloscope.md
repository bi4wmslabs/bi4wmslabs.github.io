---
title: "How to Build a DIY STM32 Oscilloscope (Step-by-Step Guide)"
title_zh: "如何自制一台 STM32 便携示波器（分步指南）"
excerpt: "A portable STM32F103-based oscilloscope and logic analyzer: hardware, enclosure, firmware and the build steps."
excerpt_zh: "基于 STM32F103 的便携示波器 / 逻辑分析仪：硬件、外壳、固件与完整制作步骤。"
date: 2026-01-20 10:10:10 +0800
categories: [projects, oscilloscope]
tags: [oscilloscope, logic-analyzer, altium, stm32f103cbt6, 3d-printed]
permalink: /posts/portable-stm32-oscilloscope/
image: /assets/img/scope.png
---

<span data-zh-title="如何自制一台 STM32 便携示波器（分步指南）" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

[![Watch Demo Video](https://img.youtube.com/vi/id5blkNelKI/0.jpg)](https://youtube.com/shorts/id5blkNelKI?feature=share)
<!-- jump to YouTube video -->

🎥 **PCBA and 3D printed case:**  

<img width="865" height="525" alt="image" src="https://github.com/user-attachments/assets/3460a333-18ea-4a40-83d8-9b5ba97710c1" />


There is a very popular multifunction oscilloscope project on GitHub that uses an STM32 development board. With just a few Dupont wires and a USB cable, it can be turned into a versatile instrument featuring:

- Oscilloscope  
- Logic analyzer  
- Voltmeter  
- Counter  
- PWM signal generator  

The project also provides a Qt-based desktop application that supports **Windows, Linux, and macOS**, making it truly cross-platform.

🔗 Original project:  

[EMBO Scope](https://github.com/bi4wms/MiniMultiScope)

---

## 🚀 My Hardware Implementation

🔗 **Project repository:**  

[BI4WMS Scope Hardeware](https://github.com/bi4wms/MiniMultiScope)

To improve usability, I designed a **dedicated hardware version** of this project.

---

## Motivation

While the original project is powerful, it has one major limitation:

> It is designed only for generic development boards and lacks dedicated hardware.

This significantly affects usability and limits its broader adoption.

To address this, I designed a **custom hardware solution**, including:

- A dedicated PCB  
- A compact 3D-printed enclosure  
- Custom silkscreen labeling  

---

## Hardware Design

The design is based on the widely used **STM32F103C8T6**, which is also used in my integrated SimpleFOC project.

<img width="865" height="678" alt="image" src="https://github.com/user-attachments/assets/8dbbecd9-b8bc-4e10-bd33-0a7c74f64e74" />


The firmware implementation is relatively straightforward, mainly leveraging:

- ADC (for voltage sampling)  
- Timer peripherals (for signal generation and measurement)  
- GPIO (for logic analysis and control)  

### Pin Mapping

Following the original Blue Pill (STM32F103C8T6) design:

| Function                     | Pins              |
|----------------------------|------------------|
| Oscilloscope / Voltmeter   | PA1, PA2, PA3    |
| Logic Analyzer             | PA1, PA2, PA3    |
| Counter                    | PA8              |
| PWM Generator              | PA15, PB6        |

---

## Schematic Design


<img width="865" height="389" alt="image" src="https://github.com/user-attachments/assets/e5579fe0-bba7-4044-9bb5-61fa7ddb4872" />


The schematic is built around a **minimal STM32F103C8T6 system**, with all required pins broken out for easy access.

---

## PCB Design

TOP
<img width="865" height="463" alt="image" src="https://github.com/user-attachments/assets/c3e18c2e-faf8-4114-9b92-cd86b9d05395" />

BOTTOM
<img width="865" height="487" alt="image" src="https://github.com/user-attachments/assets/aff6289c-b6e4-4a65-9df3-5f93b2997624" />


Given the simplicity of the circuit, a **2-layer PCB** is sufficient.

- 📏 Size: **42 mm × 22 mm**  
- Compact and enclosure-friendly  

---

## 3D PCBA

<img width="865" height="511" alt="image" src="https://github.com/user-attachments/assets/ea99b211-2c13-4fe9-be2a-ab02f43b39eb" />


A full 3D model of the assembled PCB was created to verify mechanical compatibility with the enclosure.

---

## IBOM (Interactive BOM)

An interactive BOM was generated to simplify assembly and component identification.

<img width="865" height="435" alt="image" src="https://github.com/user-attachments/assets/18130ce8-4cd8-431c-8838-310886c864f2" />


---

## Enclosure & Silkscreen

<img width="865" height="525" alt="image" src="https://github.com/user-attachments/assets/7a69e99d-6866-4e45-983d-0319e45c82a9" />


The enclosure and silkscreen graphics were designed using **JLCEDA**:

- Custom-fit enclosure  
- Clear interface labeling  
- Much better usability than bare development boards  

---

## Usage

<img width="865" height="384" alt="image" src="https://github.com/user-attachments/assets/b90b4563-8e21-49cd-aec7-b642a0042b74" />


The device connects directly to a PC via a **USB Type-C cable**.

### Steps

1. Connect the device to your computer  
2. Launch the desktop application  
3. Select the corresponding serial port  
4. Start using the instrument  

The UI is intuitive and easy to understand.

---

## Software

The desktop application is built with **Qt**, offering:

- Cross-platform support  
- Real-time waveform display  
- Easy interaction with all functions  

---

## Resources

All files are available in the GitHub repository:

- Gerber files  
- Pick-and-place files  
- BOM  
- 3D enclosure files  
- Silkscreen files  

🔗 Repository:  
[BI4WMS Scope Hardware](https://github.com/bi4wms/MiniMultiScope) 

---

## Conclusion

This project transforms a development-board-based tool into a **compact, integrated, and user-friendly multifunction instrument**.

It demonstrates how open-source projects can be extended with custom hardware to significantly improve real-world usability.

---

⭐ If you find this project useful, feel free to star the repository or contribute!

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

[![观看演示视频](https://img.youtube.com/vi/id5blkNelKI/0.jpg)](https://youtube.com/shorts/id5blkNelKI?feature=share)

🎥 **PCBA 与 3D 打印外壳：**  

<img width="865" height="525" alt="image" src="https://github.com/user-attachments/assets/3460a333-18ea-4a40-83d8-9b5ba97710c1" />



GitHub 上有一个非常受欢迎的多功能示波器项目，基于 STM32 开发板。只需几根杜邦线和一根 USB 线，就能把它变成一台功能多样的仪器：

- 示波器  
- 逻辑分析仪  
- 电压表  
- 计数器  
- PWM 信号发生器  

该项目还提供了一个基于 **Qt** 的桌面应用，支持 **Windows、Linux 和 macOS**，是真正的跨平台方案。

🔗 原项目：  

[EMBO Scope](https://github.com/bi4wms/MiniMultiScope)

---

## 🚀 我的硬件实现

🔗 **项目仓库：**  

[BI4WMS Scope Hardeware](https://github.com/bi4wms/MiniMultiScope)

为了提升易用性，我为这个项目设计了一个**专用硬件版本**。

---

## 动机

原项目虽然功能强大，但有一个明显的局限：

> 它只针对通用开发板设计，没有配套的专用硬件。

这大大影响了易用性，也限制了它的推广。

为此，我设计了一套**定制硬件方案**，包括：

- 一块专用 PCB  
- 一个紧凑的 3D 打印外壳  
- 定制丝印标识  

---

## 硬件设计

设计基于应用广泛的 **STM32F103C8T6**，我的一体化 SimpleFOC 项目用的也是这款芯片。

<img width="865" height="678" alt="image" src="https://github.com/user-attachments/assets/8dbbecd9-b8bc-4e10-bd33-0a7c74f64e74" />



固件实现相对简单，主要用到：

- ADC（用于电压采样）  
- 定时器外设（用于信号产生与测量）  
- GPIO（用于逻辑分析与控制）  

### 引脚分配

沿用原版 Blue Pill（STM32F103C8T6）的设计：

| 功能                     | 引脚              |
|----------------------------|------------------|
| 示波器 / 电压表   | PA1, PA2, PA3    |
| 逻辑分析仪             | PA1, PA2, PA3    |
| 计数器                    | PA8              |
| PWM 发生器              | PA15, PB6        |

---

## 原理图设计


<img width="865" height="389" alt="image" src="https://github.com/user-attachments/assets/e5579fe0-bba7-4044-9bb5-61fa7ddb4872" />


原理图围绕 **STM32F103C8T6 最小系统**构建，所需引脚全部引出，方便接线。

---

## PCB 设计

顶层
<img width="865" height="463" alt="image" src="https://github.com/user-attachments/assets/c3e18c2e-faf8-4114-9b92-cd86b9d05395" />

底层
<img width="865" height="487" alt="image" src="https://github.com/user-attachments/assets/aff6289c-b6e4-4a65-9df3-5f93b2997624" />


电路比较简单，用 **2 层 PCB** 就够了。

- 📏 尺寸：**42 mm × 22 mm**  
- 体积紧凑，便于装入外壳  

---

## 3D PCBA

<img width="865" height="511" alt="image" src="https://github.com/user-attachments/assets/ea99b211-2c13-4fe9-be2a-ab02f43b39eb" />


我建立了贴装完成后的完整 3D 模型，用来核对与外壳的机械配合。

---

## IBOM（交互式 BOM）

生成了交互式 BOM，方便焊接装配和识别元件。

<img width="865" height="435" alt="image" src="https://github.com/user-attachments/assets/18130ce8-4cd8-431c-8838-310886c864f2" />



---

## 外壳与丝印

<img width="865" height="525" alt="image" src="https://github.com/user-attachments/assets/7a69e99d-6866-4e45-983d-0319e45c82a9" />


外壳和丝印图案用 **JLCEDA** 设计：

- 与电路板贴合的定制外壳  
- 清晰的接口标识  
- 比裸开发板好用得多  

---

## 使用方法

<img width="865" height="384" alt="image" src="https://github.com/user-attachments/assets/b90b4563-8e21-49cd-aec7-b642a0042b74" />


设备通过一根 **USB Type-C 线**直接连到电脑。

### 使用步骤

1. 把设备接到电脑  
2. 打开桌面应用  
3. 选择对应的串口  
4. 开始使用仪器  

界面直观，容易上手。

---

## 软件

桌面应用基于 **Qt** 开发，具备：

- 跨平台支持  
- 实时波形显示  
- 各项功能操作便捷  

---

## 资源

所有文件都放在 GitHub 仓库里：

- Gerber 生产文件  
- 贴片坐标文件  
- BOM  
- 3D 外壳文件  
- 丝印文件  

🔗 仓库：  
[BI4WMS Scope Hardware](https://github.com/bi4wms/MiniMultiScope) 

---

## 结语

这个项目把一套基于开发板的工具，改造成了一台**紧凑、一体化、易用的多功能仪器**。

它说明，开源项目配上定制硬件，就能大幅改善实际使用体验。

---

⭐ 如果觉得这个项目有用，欢迎给仓库点个 star，或者参与贡献！

</div>
