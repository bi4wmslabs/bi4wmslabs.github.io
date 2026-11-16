---
title: "SimpleFOC Integrated Board from Zero to One - Part 3"
title_zh: "SimpleFOC 一体板从零到一（三）：上电与软件环境配置"
excerpt: "Board preparation, first power-up checks, and getting SimpleFOC running on the new hardware."
excerpt_zh: "板卡准备、首次上电检查，以及在新硬件上把 SimpleFOC 跑起来的完整软件配置过程。"
date: 2026-04-22 6:10:10 +0800
categories: [projects, simplefoc]
tags: [simplefoc, arduino, altium, stm32f103cbt6, motor]
permalink: /posts/simplefoc-03-power-up-and-software/
image: /assets/img/simplefoc-part3.png
series: "SimpleFOC Integrated Board"
series_no: 3
series_total: 4
---

<span data-zh-title="SimpleFOC 一体板从零到一（三）：上电与软件环境配置" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">SimpleFOC Integrated Board · From Zero to One</p>
  <p class="bi-series-nav">Design &amp; build notes · Part 3 of 4 · <a href="/posts/simplefoc-02-schematic-to-pcb/">&larr; Prev</a> · <a href="/posts/simplefoc-04-code-and-heartbeat/">Next &rarr;</a></p>
</div>

**SimpleFOC Integrated Board Hardware Practice: From Zero to One (3) – Power-Up and SimpleFOC Software Setup Guide**


### Board Preparation

Solder the components onto the PCB according to the IBOM (Interactive Bill of Materials).
<img width="865" height="435" alt="image" src="https://github.com/user-attachments/assets/0ef1415e-7911-49c2-869e-1d1338c1f5b2" />


**Key components should be soldered first.**
<img width="865" height="426" alt="image" src="https://github.com/user-attachments/assets/3221b96f-97f8-4660-9e82-1619d11b287b" />


Use a multimeter to check the power rails for any short circuits. Once there is no short circuit detected, power the board using a regulated DC power supply with current limiting enabled. Measure the 3.3V output.

If the 3.3V output is normal and the power indicator LED lights up, it indicates that the basic power-up functionality of the circuit board is working correctly. Next, we will prepare the software environment.

<img width="865" height="442" alt="image" src="https://github.com/user-attachments/assets/9ab72c98-b96d-452f-bd73-5351bfacd263" />


## SimpleFOC Software Debugging Environment Setup

### 1. Install Arduino IDE
Download and install the Arduino IDE from the official website. The classic **1.8.x** version is recommended.

### 2. Configure STM32 Support in Arduino IDE

#### 2.1 Add STM32 Core
Go to **File → Preferences**, and in the **Additional Boards Manager URLs** field, add the following link:
https://github.com/stm32duino/BoardManagerFiles/raw/main/package_stmicroelectronics_index.json

<img width="865" height="490" alt="image" src="https://github.com/user-attachments/assets/48227560-6b87-4fcb-b4df-353adc513d97" />


#### 2.2 Install STM32 Boards
Go to **Tools → Board → Boards Manager**, search for **STM32**, and install the **STM32** series development board package.
<img width="865" height="501" alt="image" src="https://github.com/user-attachments/assets/97f38e69-ae7f-405e-98dc-4c45ece5e8eb" />


#### 2.3 Install STM32CubeProgrammer
Download **STM32CubeProgrammer** from the official ST website and install it with the default settings.

#### 2.4 Test STM32 Arduino Configuration
Open any STM32 example sketch in the Arduino IDE.  

Press and hold the **BOOT0** button on the driver board, then connect the Type-C cable to power on the board (this enters bootloader mode).  
<img width="865" height="525" alt="image" src="https://github.com/user-attachments/assets/96f154f2-a0b9-451a-9a95-9a86b9bdf6e7" />


Compile and upload the sketch directly from the Arduino IDE.

> **Note**: The hardware design utilizes the STM32 built-in bootloader with UART download functionality. Since the board has an integrated USB-to-UART chip, firmware can be flashed using only a single Type-C cable.

You can also generate the binary file after compilation and upload it using **STM32CubeProgrammer** in UART (serial) mode. If the upload completes successfully, it confirms that the board's programming function is working normally.
<img width="865" height="657" alt="image" src="https://github.com/user-attachments/assets/a0e67513-04ce-49d8-87ef-5a3387f10cc2" />


### 3. Install SimpleFOC Library
Install the library using Arduino IDE’s Library Manager:

- Go to **Sketch → Include Library → Manage Libraries**
- Search for **SimpleFOC**
- Install the **SimpleFOC** library
<img width="865" height="479" alt="image" src="https://github.com/user-attachments/assets/55f1f4a5-a8ee-4942-8a01-d97c7537afd3" />

<img width="865" height="464" alt="image" src="https://github.com/user-attachments/assets/dd0432f5-7a16-4c67-aad4-3d78efb2e93d" />


### 4. Test the BI4WMS FOC Driver Kit

Use the official test code from the SimpleFOC library. If it compiles successfully, the library has been installed correctly.

Example codes can be found in the Arduino IDE under:  
**File → Examples → SimpleFOC**

### 5. Board Testing

Use the **bluepill_position_control** example. Modify the magnetic sensor and DRV8313 driver configurations according to your hardware. The example can be downloaded directly from GitHub.

https://raw.githubusercontent.com/bi4wms/SimpleFOC/refs/heads/main/bi4wmsFOC.ino

1. Press and hold the **BOOT0** button, then connect the Type-C cable to power the board.
2. Compile and upload the firmware.
3. Supply **12V** power to the motor.
4. Once initialization is complete, open the **Serial Monitor** and send commands to control the motor.

<img width="865" height="593" alt="image" src="https://github.com/user-attachments/assets/f90cd2b3-1bc7-489c-af5d-525e96bff6b6" />

<img width="865" height="634" alt="image" src="https://github.com/user-attachments/assets/72c7b201-e4c4-4ac8-8423-1cab4a980b42" />


<img width="540" height="613" alt="image" src="https://github.com/user-attachments/assets/aa4b1103-c358-497d-9aab-002adcad4533" />


For a complete list of interaction commands and detailed usage instructions, please refer to the official SimpleFOC documentation.

---

**Next Article:** We will analyze and explain the specific SimpleFOC example code in detail.

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">SimpleFOC 一体板 · 从零到一</p>
  <p class="bi-series-nav">设计与调试实录 · 第 3 篇 / 共 4 篇 · <a href="/posts/simplefoc-02-schematic-to-pcb/">&larr; 上一篇</a> · <a href="/posts/simplefoc-04-code-and-heartbeat/">下一篇 &rarr;</a></p>
</div>

**SimpleFOC 一体板硬件实践：从零到一（3）—— 上电与 SimpleFOC 软件环境搭建指南**

### 板子准备

按照 IBOM（交互式物料清单）把元器件焊接到 PCB 上。
<img width="865" height="435" alt="image" src="https://github.com/user-attachments/assets/0ef1415e-7911-49c2-869e-1d1338c1f5b2" />


**关键元器件应优先焊接。**
<img width="865" height="426" alt="image" src="https://github.com/user-attachments/assets/3221b96f-97f8-4660-9e82-1619d11b287b" />


用万用表检查各电源轨是否存在短路。确认无短路后，用带限流功能的稳压直流电源给板子上电，并测量 3.3V 输出。

如果 3.3V 输出正常、电源指示灯点亮，说明电路板的基本上电功能正常。接下来准备软件环境。

<img width="865" height="442" alt="image" src="https://github.com/user-attachments/assets/9ab72c98-b96d-452f-bd73-5351bfacd263" />


## SimpleFOC 软件调试环境搭建

### 1. 安装 Arduino IDE
从官网下载并安装 Arduino IDE，推荐使用经典的 **1.8.x** 版本。

### 2. 在 Arduino IDE 中配置 STM32 支持

#### 2.1 添加 STM32 Core
进入 **File → Preferences**，在 **Additional Boards Manager URLs** 栏中添加以下链接：
https://github.com/stm32duino/BoardManagerFiles/raw/main/package_stmicroelectronics_index.json

<img width="865" height="490" alt="image" src="https://github.com/user-attachments/assets/48227560-6b87-4fcb-b4df-353adc513d97" />


#### 2.2 安装 STM32 开发板包
进入 **Tools → Board → Boards Manager**，搜索 **STM32**，安装 **STM32** 系列开发板包。
<img width="865" height="501" alt="image" src="https://github.com/user-attachments/assets/97f38e69-ae7f-405e-98dc-4c45ece5e8eb" />



#### 2.3 安装 STM32CubeProgrammer
从 ST 官网下载 **STM32CubeProgrammer**，按默认设置安装。

#### 2.4 测试 STM32 Arduino 配置
在 Arduino IDE 中打开任意一个 STM32 示例程序。  

按住驱动板上的 **BOOT0** 按键，再插入 Type-C 线缆给板子上电（此时进入 bootloader 模式）。  
<img width="865" height="525" alt="image" src="https://github.com/user-attachments/assets/96f154f2-a0b9-451a-9a95-9a86b9bdf6e7" />


直接在 Arduino IDE 中编译并上传该程序。

> **注意**：硬件设计利用了 STM32 内置、支持 UART 下载功能的 bootloader。由于板上集成了 USB 转 UART 芯片，仅用一根 Type-C 线缆即可烧录固件。

也可以在编译后生成二进制文件，再用 **STM32CubeProgrammer** 的 UART（串口）模式烧录。若上传成功，说明板子的烧录功能正常。
<img width="865" height="657" alt="image" src="https://github.com/user-attachments/assets/a0e67513-04ce-49d8-87ef-5a3387f10cc2" />


### 3. 安装 SimpleFOC 库
通过 Arduino IDE 的库管理器安装该库：

- 进入 **Sketch → Include Library → Manage Libraries**
- 搜索 **SimpleFOC**
- 安装 **SimpleFOC** 库
<img width="865" height="479" alt="image" src="https://github.com/user-attachments/assets/55f1f4a5-a8ee-4942-8a01-d97c7537afd3" />

<img width="865" height="464" alt="image" src="https://github.com/user-attachments/assets/dd0432f5-7a16-4c67-aad4-3d78efb2e93d" />


### 4. 测试 BI4WMS FOC 驱动套件

使用 SimpleFOC 库自带的官方测试代码。若能编译通过，说明库已正确安装。

示例代码可在 Arduino IDE 的以下位置找到：  
**File → Examples → SimpleFOC**

### 5. 板子测试

使用 **bluepill_position_control** 示例。根据你的硬件修改磁传感器和 DRV8313 驱动的配置。该示例可直接从 GitHub 下载。

https://raw.githubusercontent.com/bi4wms/SimpleFOC/refs/heads/main/bi4wmsFOC.ino

1. 按住 **BOOT0** 按键，再插入 Type-C 线缆给板子上电。
2. 编译并上传固件。
3. 给电机供 **12V** 电。
4. 初始化完成后，打开 **Serial Monitor**，发送命令控制电机。

<img width="865" height="593" alt="image" src="https://github.com/user-attachments/assets/f90cd2b3-1bc7-489c-af5d-525e96bff6b6" />

<img width="865" height="634" alt="image" src="https://github.com/user-attachments/assets/72c7b201-e4c4-4ac8-8423-1cab4a980b42" />


<img width="540" height="613" alt="image" src="https://github.com/user-attachments/assets/aa4b1103-c358-497d-9aab-002adcad4533" />


完整的交互命令列表与详细用法，请参阅 SimpleFOC 官方文档。

---

**下篇文章：** 我们将详细分析并讲解具体的 SimpleFOC 示例代码。

</div>
