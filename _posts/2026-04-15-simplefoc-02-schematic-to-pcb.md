---
title: "SimpleFOC Integrated Board from Zero to One - Part 2"
title_zh: "SimpleFOC 一体板从零到一（二）：从原理图到 PCB 布局"
excerpt: "Turning the FOC driver concept into a schematic and PCB layout that can be mounted directly on the motor."
excerpt_zh: "把 FOC 驱动方案落成原理图与 PCB 布局，做成可以直接装在电机尾部的一体板。"
date: 2026-04-15 10:10:10 +0800
categories: [projects, simplefoc]
tags: [simplefoc, arduino, altium, stm32f103cbt6, motor]
permalink: /posts/simplefoc-02-schematic-to-pcb/
image: /assets/img/simplefoc-pcba.png
series: "SimpleFOC Integrated Board"
series_no: 2
series_total: 4
---

<span data-zh-title="SimpleFOC 一体板从零到一（二）：从原理图到 PCB 布局" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">SimpleFOC Integrated Board · From Zero to One</p>
  <p class="bi-series-nav">Design &amp; build notes · Part 2 of 4 · <a href="/posts/simplefoc-01-why-tail-mounted-board/">&larr; Prev</a> · <a href="/posts/simplefoc-03-power-up-and-software/">Next &rarr;</a></p>
</div>

**SimpleFOC Integrated Board Hardware Practice: From Zero to One (2) – From Schematic to PCB Layout, Teaching You How to Design an FOC Control Board That Can Be Directly Mounted on the Motor**

This article explains the complete process of creating this SimpleFOC circuit board from scratch, along with all the detailed considerations in the hardware design.

### Overall Design Considerations
The previous article mentioned some advantages and disadvantages of the official design. Combining those points, the following considerations were made:

1. Solve the problem of separate driver and control boards with low integration by integrating the driver and control circuits onto a single board.
2. Make it easy to mount directly on the rear of a brushless motor by using a circular board outline, which looks neat and coordinated when installed on the motor tail.
3. When mounting on the motor tail, mechanical mounting holes must be included on the board to securely fix it to the motor. At the same time, the onboard magnetic encoder must be placed at the geometric center of the board, directly facing the motor’s magnetic ring, to enable closed-loop position control.
4. Use the DRV8313 integrated MOSFET driver chip supported by the official SimpleFOC code to facilitate a compact design.
5. Use the AS5600 magnetic encoder supported by the official code, while reserving ABZ encoder interfaces and I2C interfaces for easy expansion.
6. Add low-side current sampling circuitry to enable closed-loop current control.
7. Integrate a USB-to-serial chip on the board with a direct Type-C interface for convenient user debugging. A single Type-C data cable connects to the computer—no more hunting for USB-to-serial adapters. An additional TTL serial port is also reserved for easy integration into projects that need to control motors.
8. For the user interface, add a heartbeat indicator LED to show the system operating status.
9. Arduino has excellent support for the STM32 series microcontrollers, and STMicroelectronics officially supports Arduino as well. Considering the richer hardware resources of STM32 chips compared to ESP series (which are more consumer-oriented), the common STM32F103CBT6 was selected.
10. For the power supply chip, Texas Instruments solutions offer excellent cost-performance. Two options were considered: TPS54302/TPS54202 or TPS5450D, differing mainly in output current and input voltage rating. To match the DRV8313, the higher voltage-rated TPS5450D was initially chosen. (Three versions were designed in total: the first two used TPS5450D; the final Rev C version switched to TPS54202 for smaller size, lower power, and easier hand-soldering DIY.)

These 10 considerations basically cover all the key details needed for the design.

### Overall Hardware Architecture Block Diagram
MCU + Driver + Power Supply + Magnetic Encoder + USB-to-Serial
<img width="1116" height="588" alt="image" src="https://github.com/user-attachments/assets/2a072a98-206b-4d10-b65a-351195aeebc3" />


### Main Chip Selection Rationale
- **Main controller**: STM32F103CBT6  
- **Magnetic encoder**: AS5600  
- **Driver chip**: DRV8313  
- **Power supply chip**: TPS5450D  

These have already been explained in the design considerations above.

- **USB-to-serial chip**: For small size, the CH340 series CH340E in MSOP package was chosen. It requires no external crystal, making it highly suitable.  
- **Current-sense amplifier**: The compact, cost-effective SGM8199A1XC6G was selected.

### Schematic Design
The hardware was designed using Altium Designer. Source files are available for download on GitHub.

<img width="865" height="504" alt="image" src="https://github.com/user-attachments/assets/1c1c99b6-e502-41b6-bf12-ba3c54dda4ed" />


The schematic is relatively simple. Here’s a quick analysis:

**Top-left section**: STM32F103 minimum system circuit. Key points to note:
1. The pins controlling the DRV8313 (IN1, IN2, IN3) must use timer channels.
2. Current-sense inputs must use ADC pins.
3. A switch was added to BOOT0 for convenient BOOT-mode programming.

This version is the Rev C schematic, which adds PWM receiver remote control and rotary knob speed control as reserved features.  
Since the microcontroller itself supports USB CDC, the CH340E was designed with compatibility in mind, and it can be removed if desired.

### Rev C Circuit Board Layout
A circular board design with a diameter of 43 mm was adopted. Four 3 mm elongated slots are cut in the center, compatible with 2204–4010 size brushless motors. These slots also naturally divide the board into functional zones, reducing interference: one zone for the microcontroller system, one for the switching power supply, and one for the driver circuit.

The front side contains the power indicator LED, system status LED, DRV driver chip, buttons, and interface components.
<img width="865" height="865" alt="image" src="https://github.com/user-attachments/assets/752c4270-d040-4af9-b125-c7c83f7a7977" />


The back side holds most of the SMD components. Since JLCPCB’s SMT service is very affordable, all SMD parts were placed on one side. Only a few larger through-hole components that are easy to hand-solder are on the other side. The two indicator LEDs had to be placed on the back of the magnetic encoder chip because the encoder must face the motor tail directly.

<img width="865" height="865" alt="image" src="https://github.com/user-attachments/assets/88cac809-9716-491b-a491-8e44b6622173" />


### Routing Instructions

**Top Layer**  
Fewer components. Mainly power ground and high-current traces for the DRV driver chip, plus control lines. Control lines are guarded with ground to reduce interference.

<img width="865" height="782" alt="image" src="https://github.com/user-attachments/assets/33428da3-67cf-4e61-8761-08480e814f5c" />


**Second Layer**  
Complete ground plane with strong/weak current area separation lines to maximize isolation between power and signal sections and minimize interference.

<img width="865" height="759" alt="image" src="https://github.com/user-attachments/assets/83feb7d7-465f-47eb-bb0e-d35613246cdb" />

**Third Layer**  
Used for sensitive traces, such as current sampling lines.

<img width="865" height="687" alt="image" src="https://github.com/user-attachments/assets/58450062-65be-4286-8fdd-84480b2f4376" />

**Bottom Layer**  
Most components are here. Routing follows the pre-planned regional divisions—each functional block stays within its own area. Differential pairs and sensitive signals are kept away from interference sources as much as possible.

<img width="865" height="769" alt="image" src="https://github.com/user-attachments/assets/4c638fb4-f2c7-42e9-b5fb-8351a67d170e" />


### Complete Design Materials
Reference: [https://github.com/bi4wms/SimpleFOC](https://github.com/bi4wms/SimpleFOC)

**Next Article Preview**:  
In the next article, we will explain in detail how to quickly set up the SimpleFOC software and hardware environment (specifically for this integrated board).

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">SimpleFOC 一体板 · 从零到一</p>
  <p class="bi-series-nav">设计与调试实录 · 第 2 篇 / 共 4 篇 · <a href="/posts/simplefoc-01-why-tail-mounted-board/">&larr; 上一篇</a> · <a href="/posts/simplefoc-03-power-up-and-software/">下一篇 &rarr;</a></p>
</div>

**SimpleFOC 一体板硬件实践：从零到一（2）—— 从原理图到 PCB 布局，手把手教你设计一块可直接安装在电机上的 FOC 控制板**

本文讲解从零开始制作这块 SimpleFOC 电路板的完整流程，以及硬件设计中的各项细节考量。

### 总体设计考量
上一篇文章提到了官方设计的一些优缺点。结合这些点，确定了以下设计考量：

1. 把驱动电路与控制电路集成到同一块板上，解决驱动板与控制板分离、集成度低的问题。
2. 采用圆形板框，便于直接安装在无刷电机尾部，装在电机尾端时整体显得整洁、协调。
3. 安装在电机尾部时，板上必须留出机械安装孔，以便牢靠地固定到电机上。同时，板载磁编码器必须置于板的几何中心，正对电机的磁环，以实现闭环位置控制。
4. 选用官方 SimpleFOC 代码支持的 DRV8313 集成 MOSFET 驱动芯片，便于实现紧凑设计。
5. 采用官方代码支持的 AS5600 磁编码器，同时预留 ABZ 编码器接口和 I2C 接口，方便扩展。
6. 加入低侧电流采样电路，实现闭环电流控制。
7. 在板上集成 USB 转串口芯片并直接引出 Type-C 接口，方便用户调试。一根 Type-C 数据线即可连接电脑，不必再四处找 USB 转串口适配器。另外还预留了一路 TTL 串口，便于集成到需要控制电机的项目中。
8. 在人机交互方面，加入一颗心跳指示 LED，用于显示系统运行状态。
9. Arduino 对 STM32 系列单片机支持得很好，STMicroelectronics 官方也对 Arduino 提供支持。考虑到 STM32 芯片相比 ESP 系列（更偏消费级）硬件资源更丰富，最终选用了常见的 STM32F103CBT6。
10. 电源芯片方面，Texas Instruments 的方案性价比出色。考虑了两种选择：TPS54302/TPS54202 或 TPS5450D，主要差别在输出电流和输入电压额定值。为匹配 DRV8313，初期选用了耐压更高的 TPS5450D。（总共设计了三个版本：前两版使用 TPS5450D；最终 Rev C 版本改用 TPS54202，以获得更小的体积、更低的功耗，也更便于手工焊接 DIY。）

这 10 条考量基本涵盖了本次设计所需的全部关键细节。

### 总体硬件架构框图
MCU + 驱动 + 电源 + 磁编码器 + USB 转串口
<img width="1116" height="588" alt="image" src="https://github.com/user-attachments/assets/2a072a98-206b-4d10-b65a-351195aeebc3" />


### 主要芯片选型依据
- **主控制器**：STM32F103CBT6  
- **磁编码器**：AS5600  
- **驱动芯片**：DRV8313  
- **电源芯片**：TPS5450D  

这些在上面的设计考量中已经说明。

- **USB 转串口芯片**：为缩小体积，选用了 MSOP 封装的 CH340 系列 CH340E。它无需外接晶振，非常合适。  
- **电流检测放大器**：选用了体积小、性价比高的 SGM8199A1XC6G。

### 原理图设计
硬件使用 Altium Designer 设计，源文件可在 GitHub 上下载。

<img width="865" height="504" alt="image" src="https://github.com/user-attachments/assets/1c1c99b6-e502-41b6-bf12-ba3c54dda4ed" />


原理图相对简单，下面做一个简要分析：

**左上部分**：STM32F103 最小系统电路。需要注意的要点：
1. 控制 DRV8313 的引脚（IN1、IN2、IN3）必须使用定时器通道。
2. 电流采样输入必须使用 ADC 引脚。
3. 在 BOOT0 上增加了一个开关，方便以 BOOT 模式烧录。

本版本为 Rev C 原理图，额外预留了 PWM 接收机遥控和旋钮调速功能。  
由于单片机本身支持 USB CDC，CH340E 是按兼容预留来设计的，不需要时可以去掉。

### Rev C 电路板布局
采用直径 43 mm 的圆形板设计。中心开有四条 3 mm 长槽，兼容 2204–4010 规格的无刷电机。这些槽也自然地把板子划分成不同功能区，减少干扰：一个区域放单片机系统，一个区域放开关电源，一个区域放驱动电路。

正面放置电源指示灯、系统状态灯、DRV 驱动芯片、按键和接口器件。
<img width="865" height="865" alt="image" src="https://github.com/user-attachments/assets/752c4270-d040-4af9-b125-c7c83f7a7977" />


背面放置了大部分 SMD 器件。由于 JLCPCB 的 SMT 贴片服务价格很低，所有 SMD 器件都放在同一面，另一面只留了少数体积较大、便于手工焊接的直插器件。两颗指示灯必须放在磁编码器芯片的背面，因为编码器要正对电机尾部。

<img width="865" height="865" alt="image" src="https://github.com/user-attachments/assets/88cac809-9716-491b-a491-8e44b6622173" />


### 布线说明

**顶层**  
器件较少，主要是电源地和 DRV 驱动芯片的大电流走线，外加控制线。控制线做了包地处理，以减少干扰。

<img width="865" height="782" alt="image" src="https://github.com/user-attachments/assets/33428da3-67cf-4e61-8761-08480e814f5c" />


**第二层**  
完整的地平面，并用强/弱电流区域分隔线，最大限度隔离电源区与信号区、把干扰降到最低。

<img width="865" height="759" alt="image" src="https://github.com/user-attachments/assets/83feb7d7-465f-47eb-bb0e-d35613246cdb" />

**第三层**  
用于走敏感信号线，例如电流采样线。

<img width="865" height="687" alt="image" src="https://github.com/user-attachments/assets/58450062-65be-4286-8fdd-84480b2f4376" />

**底层**  
大部分器件都在这一层。布线遵循预先规划的区域划分——各功能模块各守其区域。差分对和敏感信号尽量远离干扰源。

<img width="865" height="769" alt="image" src="https://github.com/user-attachments/assets/4c638fb4-f2c7-42e9-b5fb-8351a67d170e" />


### 完整设计资料
参考资料：[https://github.com/bi4wms/SimpleFOC](https://github.com/bi4wms/SimpleFOC)

**下篇预告**：  
下一篇文章将详细讲解如何快速搭建 SimpleFOC 软硬件环境（专门针对这块一体板）。

</div>
