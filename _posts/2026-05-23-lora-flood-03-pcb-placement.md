---
title: "LoRa Flood Sensor Development Series - Part 3 PCB Placement Guide"
title_zh: "LoRa 水浸传感器开发系列（三）：PCB 布局要点"
excerpt: "Fitting the PCBA into an existing 50 mm enclosure, and the placement rules that keep the RF and sensing sections clean."
excerpt_zh: "把 PCBA 塞进现成的 50 mm 外壳，以及让射频与检测两部分互不干扰的布局规则。"
date: 2026-05-23 06:10:10 +0800
categories: [projects, lora]
tags: [lora, arduino, kicad, stm32g030, iot]
permalink: /posts/lora-flood-03-pcb-placement/
image: /assets/img/lora-part3.png
series: "LoRa Flood Sensor"
series_no: 3
series_total: 3
---

<span data-zh-title="LoRa 水浸传感器开发系列（三）：PCB 布局要点" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">LoRa Flood Sensor Development Series</p>
  <p class="bi-series-nav">Design &amp; build notes · Part 3 of 3 · <a href="/posts/lora-flood-02-schematic-and-parts/">&larr; Prev</a></p>
</div>

## Design Overview

We are using an **existing enclosure** for a **shell-fit PCBA design**.

<img width="865" height="865" alt="image" src="https://github.com/user-attachments/assets/7fd44c42-342c-415a-82e0-c59b88a45fc5" />

<img width="865" height="865" alt="image" src="https://github.com/user-attachments/assets/2792f5b1-dbf3-45db-8062-b95e570eb1d1" />


- **Enclosure outer diameter**: 50mm  
- Due to **waterproof design**, the internal space is quite limited.  
- The other side must accommodate a **coin cell battery**, therefore **only single-sided component placement** is allowed.

<img width="865" height="387" alt="image" src="https://github.com/user-attachments/assets/1c9cb851-eec5-4830-bec4-10eb3cfd03ce" />


---

## Step 1: Determine PCBA Outline

1. Locate the **internal PCBA dimension drawing** of the enclosure.
2. Open the drawing with **CAD software** (AutoCAD, DraftSight, etc.).
3. Carefully study the drawing and identify **keep-out areas** (regions where components are prohibited).

<img width="865" height="387" alt="image" src="https://github.com/user-attachments/assets/6feef31d-7b9c-4055-b614-352d97d44a24" />

---

## Step 2: Create Board Outline in KiCad

1. Open your project in **KiCad**.
2. Import the PCBA outline:
   - Go to **File → Import → Graphics** (or use DXF import).
   - Select the prepared dimension file and import it.
3. After import, delete all unnecessary graphics and layers.
4. Keep only the final **PCBA board outline** on the **Edge.Cuts** layer.
<img width="865" height="410" alt="image" src="https://github.com/user-attachments/assets/ecd63b86-9d9b-4efe-9c7f-7e4409be6a5c" />

<img width="865" height="836" alt="image" src="https://github.com/user-attachments/assets/13059c20-76e2-44f2-878a-c27b6d902fe5" />

<img width="865" height="836" alt="image" src="https://github.com/user-attachments/assets/603b8dd0-53d1-443f-b349-3c6de6ce4355" />


---

## Step 3: Component Layout Guidelines

The layout is relatively simple due to single-sided constraints. Follow these rules:

- **Single-sided component placement only**.
- Place **filtering capacitors** as close as possible to the power pins of ICs.
- Arrange components **following the signal flow** direction.
- Position connectors, electrodes, and buttons **exactly** according to the mechanical drawing specifications.
- Pay special attention to **height restrictions** — check component height in limited clearance areas.
- Reserve enough space for the **coin cell battery** on the opposite side.

<img width="865" height="836" alt="image" src="https://github.com/user-attachments/assets/9fa70d05-08aa-490f-a0a6-9b8eb97dff7a" />

---

## 3D Effect Verification

After completing the layout and assigning 3D models in KiCad:
- Use **View → 3D Viewer** to check the overall assembly.
- Verify clearance with the enclosure and coin cell battery.
- Ensure no component interference with the waterproof shell.

<img width="865" height="502" alt="image" src="https://github.com/user-attachments/assets/98c9fb77-86b1-4bb7-8a64-c3c2716cfd56" />


---

## Key Design Principles Summary

- Strictly follow mechanical constraints and keep-out zones
- Prioritize signal integrity and power integrity
- Place decoupling capacitors near power pins
- Maintain sufficient clearance for battery and waterproofing
- Pay attention to component height restrictions
- Optimize component placement according to signal flow

---

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">LoRa 水浸传感器开发系列</p>
  <p class="bi-series-nav">设计与调试实录 · 第 3 篇 / 共 3 篇 · <a href="/posts/lora-flood-02-schematic-and-parts/">&larr; 上一篇</a></p>
</div>

## 设计概述

我们采用一款**现有外壳**，进行**适配外壳的 PCBA 设计**。

<img width="865" height="865" alt="image" src="https://github.com/user-attachments/assets/7fd44c42-342c-415a-82e0-c59b88a45fc5" />

<img width="865" height="865" alt="image" src="https://github.com/user-attachments/assets/2792f5b1-dbf3-45db-8062-b95e570eb1d1" />



- **外壳外径**：50mm  
- 由于采用**防水设计**，内部空间相当有限。  
- 另一面必须容纳**纽扣电池**，因此**只允许单面贴装元件**。

<img width="865" height="387" alt="image" src="https://github.com/user-attachments/assets/1c9cb851-eec5-4830-bec4-10eb3cfd03ce" />



---

## 第 1 步：确定 PCBA 外形轮廓

1. 找到外壳的**内部 PCBA 尺寸图**。
2. 用 **CAD 软件**（AutoCAD、DraftSight 等）打开图纸。
3. 仔细研读图纸，识别**禁布区**（禁止放置元件的区域）。

<img width="865" height="387" alt="image" src="https://github.com/user-attachments/assets/6feef31d-7b9c-4055-b614-352d97d44a24" />

---

## 第 2 步：在 KiCad 中创建板框

1. 在 **KiCad** 中打开你的项目。
2. 导入 PCBA 外形轮廓：
   - 依次选择 **File → Import → Graphics**（或使用 DXF 导入）。
   - 选择准备好的尺寸文件并导入。
3. 导入后，删除所有多余的图形和图层。
4. 只在 **Edge.Cuts** 层保留最终的 **PCBA 板框**。
<img width="865" height="410" alt="image" src="https://github.com/user-attachments/assets/ecd63b86-9d9b-4efe-9c7f-7e4409be6a5c" />

<img width="865" height="836" alt="image" src="https://github.com/user-attachments/assets/13059c20-76e2-44f2-878a-c27b6d902fe5" />

<img width="865" height="836" alt="image" src="https://github.com/user-attachments/assets/603b8dd0-53d1-443f-b349-3c6de6ce4355" />


---

## 第 3 步：元件布局准则

受单面布局限制，布局相对简单。遵循以下规则：

- **仅单面贴装元件**。
- **滤波电容**尽量靠近 IC 的电源引脚放置。
- 按**信号流**方向排布元件。
- 连接器、电极和按键的位置**严格**按机械图纸规格摆放。
- 特别注意**高度限制**——在净空有限的区域核对元件高度。
- 在另一面为**纽扣电池**预留足够空间。

<img width="865" height="836" alt="image" src="https://github.com/user-attachments/assets/9fa70d05-08aa-490f-a0a6-9b8eb97dff7a" />

---

## 3D 效果验证

完成布局并在 KiCad 中指定 3D 模型后：
- 使用 **View → 3D Viewer** 查看整体装配。
- 核对与外壳、纽扣电池之间的间隙。
- 确保没有元件与防水外壳干涉。

<img width="865" height="502" alt="image" src="https://github.com/user-attachments/assets/98c9fb77-86b1-4bb7-8a64-c3c2716cfd56" />


---

## 关键设计原则总结

- 严格遵守机械约束和禁布区
- 优先考虑信号完整性与电源完整性
- 去耦电容靠近电源引脚放置
- 为电池和防水结构保留足够间隙
- 注意元件高度限制
- 按信号流优化元件摆放

---

</div>
