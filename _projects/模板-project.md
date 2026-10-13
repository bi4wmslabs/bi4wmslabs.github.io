---
title: "Example Motor Controller"
title_zh: "示例电机控制器"
short_name: "Example Board"
short_name_zh: "示例板卡"
category: "Motor Control"
category_zh: "电机控制"
excerpt: "A compact BLDC controller for experimenting with open-source FOC."
excerpt_zh: "用于试验开源 FOC 的紧凑型无刷电机控制器。"
featured: false
github: "https://github.com/bi4wms/example-motor-controller"
---

<!-- 页面大标题的中文（放在正文第一行，不会显示） -->
<span data-zh-title="示例电机控制器" hidden></span>

<div class="bi-lang-en" markdown="1">

## Overview

A compact motor-control board for experimenting with open-source FOC and small
BLDC motors. This page documents the design intent, the key component choices,
and what still needs validation.

## Specifications

| Item | Value |
| --- | --- |
| MCU | STM32G431CBU6 |
| Driver | DRV8302 |
| Input | 12–24 V |
| Peak phase current | 15 A |
| Interfaces | CAN, UART, SWD |

## Status

- Schematic: complete
- Layout: in review
- Firmware: basic FOC loop running
- Validation: pending thermal test

</div>

<div class="bi-lang-zh" markdown="1">

## 概述

用于试验开源 FOC 与小型无刷电机的紧凑型电机控制板。本页记录设计意图、
关键器件选型，以及尚待验证的部分。

## 规格

| 项目 | 数值 |
| --- | --- |
| 主控 | STM32G431CBU6 |
| 驱动 | DRV8302 |
| 输入 | 12–24 V |
| 相电流峰值 | 15 A |
| 接口 | CAN、UART、SWD |

## 当前状态

- 原理图：已完成
- PCB 布局：评审中
- 固件：基础 FOC 环路已跑通
- 验证：待做温升测试

</div>

---

<div class="bi-lang-en" markdown="1">

### License

Hardware: CERN-OHL-S. Firmware: MIT. Documentation: CC BY-SA 4.0.

</div>

<div class="bi-lang-zh" markdown="1">

### 许可

硬件：CERN-OHL-S。固件：MIT。文档：CC BY-SA 4.0。

</div>
