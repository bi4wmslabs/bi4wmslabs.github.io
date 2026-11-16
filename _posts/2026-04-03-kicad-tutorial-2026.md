---
title: "KiCad Tutorial 2026: From Schematic to Gerber in One Complete Guide"
title_zh: "KiCad 2026 完整教程：从原理图到 Gerber 一次讲透"
excerpt: "A single, complete KiCad walkthrough: schematic, DRC, PCB layout, useful tools and manufacturing outputs, with 60 annotated screenshots."
excerpt_zh: "一份完整的 KiCad 实操指南：原理图、DRC、PCB 布局、实用工具与生产文件输出，配 60 张步骤截图。"
date: 2026-04-03 10:40:10 +0800
categories: [tutorial, kicad]
tags: [kicad, pcb-design, schematic, gerber]
permalink: /posts/kicad-tutorial-2026/
image: /assets/img/kicad.png
series: "KiCad Tutorial 2026"
series_no: 1
series_total: 1
---

<span data-zh-title="KiCad 2026 完整教程：从原理图到 Gerber 一次讲透" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">KiCad 2026 · Complete Walkthrough</p>
  <p class="bi-series-nav">Complete guide · 2026 edition</p>
</div>

## Part 1: Schematic Design

### 1.1 Create a New Project
![](/assets/img/postimg/tutorial/howtousekicad/1.png)

### 1.2 Open Schematic Design
![](/assets/img/postimg/tutorial/howtousekicad/2.png)

### 1.3 Double-click to Open the Schematic  
By default, this opens the root schematic page.
![](/assets/img/postimg/tutorial/howtousekicad/3.png)

### 1.4 Use Hierarchical Schematic Structure  
The root directory mainly defines the overall logical relationships.
![](/assets/img/postimg/tutorial/howtousekicad/4.png)

### 1.5 Create Hierarchical Schematics  
Assign meaningful names to hierarchical schematic sheets.
![](/assets/img/postimg/tutorial/howtousekicad/5.png)

### 1.6 Enter Specific Sheets  
Select components and begin drawing the schematic.
![](/assets/img/postimg/tutorial/howtousekicad/6.png)

### 1.7 Configure Display Settings  
Adjust page view, cursor, and display preferences.
![](/assets/img/postimg/tutorial/howtousekicad/7.png)

### 1.8 Draw Schematic Symbols  
Use and modify existing symbols as needed.
![](/assets/img/postimg/tutorial/howtousekicad/8.png)

### 1.9 Create a Schematic Library  
Manage custom schematic symbols efficiently.
![](/assets/img/postimg/tutorial/howtousekicad/9.png)

### 1.10 Save Symbols to Your Library  
Store completed symbols in your custom library for reuse.
![](/assets/img/postimg/tutorial/howtousekicad/10.png)

### 1.11 Complete the Schematic Framework
![](/assets/img/postimg/tutorial/howtousekicad/11.png)

---

## Part 2: Schematic Refinement and Adjustment

### 2.1 Assign Reference Designators by Page Number
![](/assets/img/postimg/tutorial/howtousekicad/2.1.png)

![](/assets/img/postimg/tutorial/howtousekicad/2.1-2.png)

### 2.2 Run DRC (Design Rule Check)
![](/assets/img/postimg/tutorial/howtousekicad/2.2.png)

### 2.3 Use Net Labels in Schematics 
![](/assets/img/postimg/tutorial/howtousekicad/2.3.png)

#### 2.3.1 Place Hierarchical Labels Across Different Sheets  
![](/assets/img/postimg/tutorial/howtousekicad/2.3.1.png)

![](/assets/img/postimg/tutorial/howtousekicad/2.3.1-2.png)

![](/assets/img/postimg/tutorial/howtousekicad/2.3.1-3.png)

#### 2.3.2 Synchronize Pins and Labels in Root Sheet,Connect hierarchical labels properly.
![](/assets/img/postimg/tutorial/howtousekicad/2.3.2-1.png)

![](/assets/img/postimg/tutorial/howtousekicad/2.3.2-2.png)

#### 2.3.3 Connect All Hierarchical Labels in Root Sheet  
![](/assets/img/postimg/tutorial/howtousekicad/2.3.3-1.png)

![](/assets/img/postimg/tutorial/howtousekicad/2.3.3-2.png)

### 2.4 Edit Symbol Properties  

#### 2.4.1 Modify Symbol Attributes,Adjust properties based on requirements.
![](/assets/img/postimg/tutorial/howtousekicad/2.4.1.png)

#### 2.4.2 Update Library and Synchronize Changes  
![](/assets/img/postimg/tutorial/howtousekicad/2.4.2.png)

---

## Part 3: Preparation Before Importing to PCB

### 3.1 Perform DRC Check, Ensure no errors; review warnings for PCB impact.
![](/assets/img/postimg/tutorial/howtousekicad/3.1.png)

### 3.2 Assign PCB Footprints to Symbols  
- Verify page by page
![](/assets/img/postimg/tutorial/howtousekicad/3.2.png)  
- Select footprints from libraries
![](/assets/img/postimg/tutorial/howtousekicad/3.2-2.png)
- Modify individual symbol footprints if needed
![](/assets/img/postimg/tutorial/howtousekicad/3.2-3.png)
- Ensure all symbols have correct footprints
![](/assets/img/postimg/tutorial/howtousekicad/3.2-4.png)

### 3.3 Import Symbols and Connectivity into PCB  
![](/assets/img/postimg/tutorial/howtousekicad/3.3.png)

![](/assets/img/postimg/tutorial/howtousekicad/3.3-2.png)

### 3.4 Import Components into PCB
![](/assets/img/postimg/tutorial/howtousekicad/3.4.png)

### 3.5 Configure PCB Layer Stack  
![](/assets/img/postimg/tutorial/howtousekicad/3.5.png)


---

## Part 4: Useful Tools in PCB Design

### 4.1 Add Dimension Annotations  
![](/assets/img/postimg/tutorial/howtousekicad/4.1.png)

### 4.2 Align Components  
![](/assets/img/postimg/tutorial/howtousekicad/4.2.png)


### 4.3 Chamfer Board Outline
![](/assets/img/postimg/tutorial/howtousekicad/4.3.png)

![](/assets/img/postimg/tutorial/howtousekicad/4.3-2.png)


### 4.4 Show/Hide Net Connections  
![](/assets/img/postimg/tutorial/howtousekicad/4.4.png)


### 4.5 Hide Reference Designators in 3D View  
![](/assets/img/postimg/tutorial/howtousekicad/4.5.png)


### 4.6 Define Routing Rules
![](/assets/img/postimg/tutorial/howtousekicad/4.6.png)

![](/assets/img/postimg/tutorial/howtousekicad/4.6-2.png)


### 4.7 Set 50 Ohm Impedance Traces  
![](/assets/img/postimg/tutorial/howtousekicad/4.7.png)


### 4.8 Adjust Trace Width During Routing,Shortcut key: "E"

![](/assets/img/postimg/tutorial/howtousekicad/4.8.png)


### 4.9 Hide Specific Net Ratsnest Lines  

![](/assets/img/postimg/tutorial/howtousekicad/4.9.png)


### 4.10 Highlight Nets  

![](/assets/img/postimg/tutorial/howtousekicad/4.10.png)

### 4.11 Hide Silkscreen Reference Designators 

![](/assets/img/postimg/tutorial/howtousekicad/4.11.png)


### 4.12 Length Matching Routing,Use the length tuning tool.

![](/assets/img/postimg/tutorial/howtousekicad/4.12.png)


### 4.13 Batch Modify Via Sizes  
- Select the region

![](/assets/img/postimg/tutorial/howtousekicad/4.13.png)

- Modify via parameters

![](/assets/img/postimg/tutorial/howtousekicad/4.13-2.png)

![](/assets/img/postimg/tutorial/howtousekicad/4.13-2.png)


### 4.14 Set Copper Pour Nets  

![](/assets/img/postimg/tutorial/howtousekicad/4.14.png)


---

## Part 5: Generate PCB Manufacturing Data

### 5.1 Perform Final DRC Check  

![](/assets/img/postimg/tutorial/howtousekicad/5.1.png)

### 5.2 Generate Gerber Files  

![](/assets/img/postimg/tutorial/howtousekicad/5.2.png)

Select file save location.
![](/assets/img/postimg/tutorial/howtousekicad/5.2-2.png)

### 5.3 Generate Drill Files  

![](/assets/img/postimg/tutorial/howtousekicad/5.3.png)

Save in the same location as Gerber files.

![](/assets/img/postimg/tutorial/howtousekicad/5.3-2.png)

### 5.4 Use KiCad Gerber Viewer Verify generated files.  
![](/assets/img/postimg/tutorial/howtousekicad/5.4.png)


### 5.5 Generate Position (Pick-and-Place) Files  
![](/assets/img/postimg/tutorial/howtousekicad/5.5.png)

Choose save path.
![](/assets/img/postimg/tutorial/howtousekicad/5.5-2.png)

### 5.6 Generate BOM (Bill of Materials)  
![](/assets/img/postimg/tutorial/howtousekicad/5.6.png)

OK, all done!

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">KiCad 2026 · 完整实操教程</p>
  <p class="bi-series-nav">完整教程 · 2026 版</p>
</div>

## 第 1 部分：原理图设计

### 1.1 新建项目
![](/assets/img/postimg/tutorial/howtousekicad/1.png)

### 1.2 打开原理图设计
![](/assets/img/postimg/tutorial/howtousekicad/2.png)

### 1.3 双击打开原理图
默认会打开根原理图页面。
![](/assets/img/postimg/tutorial/howtousekicad/3.png)

### 1.4 使用层次原理图结构
根目录主要用于定义整体的逻辑关系。
![](/assets/img/postimg/tutorial/howtousekicad/4.png)

### 1.5 创建层次原理图
为各张层次原理图纸取有意义的名字。
![](/assets/img/postimg/tutorial/howtousekicad/5.png)

### 1.6 进入具体图纸
选择元件，开始绘制原理图。
![](/assets/img/postimg/tutorial/howtousekicad/6.png)

### 1.7 配置显示设置
调整页面视图、光标和显示偏好。
![](/assets/img/postimg/tutorial/howtousekicad/7.png)

### 1.8 绘制原理图符号
按需使用并修改现有符号。
![](/assets/img/postimg/tutorial/howtousekicad/8.png)

### 1.9 创建原理图库
高效管理自定义原理图符号。
![](/assets/img/postimg/tutorial/howtousekicad/9.png)

### 1.10 把符号保存到自己的库
把做好的符号存入自定义库，方便复用。
![](/assets/img/postimg/tutorial/howtousekicad/10.png)

### 1.11 完成原理图框架
![](/assets/img/postimg/tutorial/howtousekicad/11.png)

---

## 第 2 部分：原理图的细化与调整

### 2.1 按页码分配参考标号
![](/assets/img/postimg/tutorial/howtousekicad/2.1.png)

![](/assets/img/postimg/tutorial/howtousekicad/2.1-2.png)

### 2.2 运行设计规则检查（DRC）
![](/assets/img/postimg/tutorial/howtousekicad/2.2.png)

### 2.3 在原理图中使用网络标签
![](/assets/img/postimg/tutorial/howtousekicad/2.3.png)

#### 2.3.1 在不同图纸之间放置层次标签
![](/assets/img/postimg/tutorial/howtousekicad/2.3.1.png)

![](/assets/img/postimg/tutorial/howtousekicad/2.3.1-2.png)

![](/assets/img/postimg/tutorial/howtousekicad/2.3.1-3.png)

#### 2.3.2 在根图纸中同步引脚与标签，正确连接层次标签。
![](/assets/img/postimg/tutorial/howtousekicad/2.3.2-1.png)

![](/assets/img/postimg/tutorial/howtousekicad/2.3.2-2.png)

#### 2.3.3 在根图纸中连接所有层次标签
![](/assets/img/postimg/tutorial/howtousekicad/2.3.3-1.png)

![](/assets/img/postimg/tutorial/howtousekicad/2.3.3-2.png)

### 2.4 编辑符号属性

#### 2.4.1 修改符号属性，按需求调整各项属性。
![](/assets/img/postimg/tutorial/howtousekicad/2.4.1.png)

#### 2.4.2 更新库并同步变更
![](/assets/img/postimg/tutorial/howtousekicad/2.4.2.png)

---

## 第 3 部分：导入 PCB 前的准备

### 3.1 执行设计规则检查（DRC），确保没有错误；逐一查看警告是否影响 PCB。
![](/assets/img/postimg/tutorial/howtousekicad/3.1.png)

### 3.2 为符号指定 PCB 封装
- 逐页核对
![](/assets/img/postimg/tutorial/howtousekicad/3.2.png)
- 从库中选择封装
![](/assets/img/postimg/tutorial/howtousekicad/3.2-2.png)
- 必要时修改单个符号的封装
![](/assets/img/postimg/tutorial/howtousekicad/3.2-3.png)
- 确保所有符号都有正确的封装
![](/assets/img/postimg/tutorial/howtousekicad/3.2-4.png)

### 3.3 把符号与连接关系导入 PCB
![](/assets/img/postimg/tutorial/howtousekicad/3.3.png)

![](/assets/img/postimg/tutorial/howtousekicad/3.3-2.png)

### 3.4 把元件导入 PCB
![](/assets/img/postimg/tutorial/howtousekicad/3.4.png)

### 3.5 配置 PCB 层叠结构
![](/assets/img/postimg/tutorial/howtousekicad/3.5.png)


---

## 第 4 部分：PCB 设计中的实用工具

### 4.1 添加尺寸标注
![](/assets/img/postimg/tutorial/howtousekicad/4.1.png)

### 4.2 对齐元件
![](/assets/img/postimg/tutorial/howtousekicad/4.2.png)


### 4.3 给板框倒角
![](/assets/img/postimg/tutorial/howtousekicad/4.3.png)

![](/assets/img/postimg/tutorial/howtousekicad/4.3-2.png)



### 4.4 显示/隐藏网络连接
![](/assets/img/postimg/tutorial/howtousekicad/4.4.png)


### 4.5 在 3D 视图中隐藏参考标号
![](/assets/img/postimg/tutorial/howtousekicad/4.5.png)


### 4.6 定义走线规则
![](/assets/img/postimg/tutorial/howtousekicad/4.6.png)

![](/assets/img/postimg/tutorial/howtousekicad/4.6-2.png)



### 4.7 设置 50 Ohm 阻抗走线
![](/assets/img/postimg/tutorial/howtousekicad/4.7.png)


### 4.8 走线过程中调整线宽，快捷键："E"

![](/assets/img/postimg/tutorial/howtousekicad/4.8.png)



### 4.9 隐藏指定网络的飞线

![](/assets/img/postimg/tutorial/howtousekicad/4.9.png)


### 4.10 高亮网络

![](/assets/img/postimg/tutorial/howtousekicad/4.10.png)

### 4.11 隐藏丝印上的参考标号

![](/assets/img/postimg/tutorial/howtousekicad/4.11.png)


### 4.12 等长走线，使用长度调节工具。

![](/assets/img/postimg/tutorial/howtousekicad/4.12.png)


### 4.13 批量修改过孔尺寸
- 框选区域

![](/assets/img/postimg/tutorial/howtousekicad/4.13.png)

- 修改过孔参数

![](/assets/img/postimg/tutorial/howtousekicad/4.13-2.png)

![](/assets/img/postimg/tutorial/howtousekicad/4.13-2.png)



### 4.14 设置覆铜所属网络

![](/assets/img/postimg/tutorial/howtousekicad/4.14.png)


---

## 第 5 部分：生成 PCB 生产数据

### 5.1 执行最终设计规则检查（DRC）

![](/assets/img/postimg/tutorial/howtousekicad/5.1.png)

### 5.2 生成 Gerber 生产文件

![](/assets/img/postimg/tutorial/howtousekicad/5.2.png)

选择文件保存位置。
![](/assets/img/postimg/tutorial/howtousekicad/5.2-2.png)

### 5.3 生成钻孔文件

![](/assets/img/postimg/tutorial/howtousekicad/5.3.png)

保存到与 Gerber 生产文件相同的位置。

![](/assets/img/postimg/tutorial/howtousekicad/5.3-2.png)

### 5.4 使用 KiCad Gerber Viewer 核对生成的文件。
![](/assets/img/postimg/tutorial/howtousekicad/5.4.png)


### 5.5 生成坐标（贴片）文件
![](/assets/img/postimg/tutorial/howtousekicad/5.5.png)

选择保存路径。
![](/assets/img/postimg/tutorial/howtousekicad/5.5-2.png)

### 5.6 生成 BOM（物料清单）
![](/assets/img/postimg/tutorial/howtousekicad/5.6.png)

好了，全部完成！

</div>
