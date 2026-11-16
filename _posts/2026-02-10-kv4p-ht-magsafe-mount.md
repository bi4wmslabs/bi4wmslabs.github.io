---
title: "KV4P HT DIY Guide - Add MagSafe Mount for Android Ham Radio"
title_zh: "KV4P-HT DIY 指南：给安卓业余无线电电台加 MagSafe 支架"
excerpt: "A practical MagSafe mount modification for the KV4P-HT Android ham radio, with printed parts and assembly notes."
excerpt_zh: "给 KV4P-HT 安卓业余无线电电台加装 MagSafe 支架，含打印件与装配要点。"
date: 2026-02-10 10:10:10 +0800
categories: [projects, kv4p-ht]
tags: [kicad, hamradio, kv4p-ht, magsafe, 3d-print]
permalink: /posts/kv4p-ht-magsafe-mount/
image: /assets/img/kv4p-magsafe.png
---

<span data-zh-title="KV4P-HT DIY 指南：给安卓业余无线电电台加 MagSafe 支架" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

All design files can be found in my github

[KV4P-HT-MagSafe](https://github.com/bi4wms/kv4p-ht-MagSafe)


<img width="877" height="671" alt="image" src="https://github.com/user-attachments/assets/fdcfdee2-3ad9-4425-a999-20da6b311bc2" />

## What is KV4P HT?

KV4P HT is an open-source DIY project that turns an Android phone into a portable ham radio transceiver. It connects hardware and software to enable radio communication directly from your smartphone.

KV4P-HT is currently one of the most popular open-source amateur radio projects. It allows your Android phone to function as a portable handheld transceiver (HT). Depending on the RF module selected, it can operate on either the **V-band (144 MHz)** or **U-band (430 MHz)**, but not both at the same time.

The official project provides implementations using off-the-shelf development boards, as well as a custom PCB version designed in KiCad. After dedicating time last year to learning KiCad and completing two practical projects, I have become comfortable designing circuits with it.

## Why Add a MagSafe Mount?

Adding MagSafe improves usability:

Easier mounting on phone
Better portability
Cleaner setup
Quick attach/detach

Although KV4P-HT does not yet support iOS, many modern Android phones now feature MagSafe-like magnetic attachment. Designing a magnetic version of KV4P-HT would make it much more convenient to attach and detach on the go. Inspired by the sleek MagSafe case from the Meshmastic project, I decided to create my own magnetic enclosure.

<img width="865" height="662" alt="image" src="https://github.com/user-attachments/assets/4723d463-9355-406a-aece-3809a6acef4c" />


Additionally, I found the official KiCad project could be improved in terms of style, organization, and standardization. Therefore, I am refactoring and optimizing it.

<img width="865" height="581" alt="image" src="https://github.com/user-attachments/assets/a79f3f93-f570-49f7-b00f-d13aab5a4a55" />

<img width="1089" height="649" alt="image" src="https://github.com/user-attachments/assets/814df652-de5c-4904-8342-60dc8563e53b" />

<img width="1124" height="603" alt="image" src="https://github.com/user-attachments/assets/c9d55291-d3e8-403d-b93a-479452ba2d3e" />


## Materials and Tools Needed

KV4P HT board
MagSafe magnet ring
Power components
3D printed case (if any)
Tools (soldering iron, etc.)

**Main Changes in This Revision:**
- Schematic connectivity remains largely unchanged.
- Replaced the USB-to-serial chip from CP2102N to **CH340K** (the original CP2102N is more expensive and harder to hand-solder).
- Improved the schematic drawing style by using local net labels within pages instead of cross-page or global port connections.

**Current Issues:**
1. The PID of the CH340K is not yet supported by the official Android App (Web App works without any problems).
2. The enclosure design is too thick. I plan to switch to a sandwich-style SMA connector to reduce thickness.
3. The 3D model lacks a dedicated slot for the ferrite bead, causing it to protrude significantly and affecting the overall appearance.

[![Watch the video](https://img.youtube.com/vi/y1fTFUp0ZME/0.jpg)](https://youtube.com/shorts/y1fTFUp0ZME)

## Common Issues and Fixes

KV4P HT not working?
Check wiring
Check app config
MagSafe not aligned?
Adjust ring position
Use stronger magnets

## Who Is This Project For?
Ham radio hobbyists
DIY electronics enthusiasts
Android tinkerers

## Final Thoughts
KV4P HT + MagSafe makes setup cleaner
Easy portable radio solution
Great DIY project

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

所有设计文件都可以在我的 GitHub 上找到

[KV4P-HT-MagSafe](https://github.com/bi4wms/kv4p-ht-MagSafe)


<img width="877" height="671" alt="image" src="https://github.com/user-attachments/assets/fdcfdee2-3ad9-4425-a999-20da6b311bc2" />

## 什么是 KV4P HT？

KV4P HT 是一个开源 DIY 项目，能把 Android 手机变成便携式业余无线电收发信机。它把硬件与软件结合起来，让你直接通过智能手机进行无线电通信。

KV4P-HT 是目前最受欢迎的开源业余无线电项目之一。它能让你的 Android 手机充当便携式手持电台（HT）。根据所选 RF 模块的不同，它可以工作在 **V 波段（144 MHz）** 或 **U 波段（430 MHz）**，但不能同时工作在两个波段。

官方项目既提供了使用现成开发板的实现，也提供了用 KiCad 设计的定制 PCB 版本。去年我花时间学习了 KiCad 并完成了两个实际项目，如今已能熟练用它设计电路。

## 为什么要加 MagSafe 支架？

加装 MagSafe 可提升易用性：

更易于安装到手机上
更佳的便携性
更简洁的装配
快速安装/拆卸

尽管 KV4P-HT 目前尚不支持 iOS，但许多现代 Android 手机已具备类 MagSafe 磁吸功能。设计磁吸版 KV4P-HT 会让外出时的安装与拆卸方便得多。受 Meshmastic 项目精致的 MagSafe 外壳启发，我决定做一个自己的磁吸外壳。

<img width="865" height="662" alt="image" src="https://github.com/user-attachments/assets/4723d463-9355-406a-aece-3809a6acef4c" />


此外，我发现官方 KiCad 项目在风格、组织结构和规范性方面还有改进空间。因此，我正在对它进行重构和优化。

<img width="865" height="581" alt="image" src="https://github.com/user-attachments/assets/a79f3f93-f570-49f7-b00f-d13aab5a4a55" />

<img width="1089" height="649" alt="image" src="https://github.com/user-attachments/assets/814df652-de5c-4904-8342-60dc8563e53b" />

<img width="1124" height="603" alt="image" src="https://github.com/user-attachments/assets/c9d55291-d3e8-403d-b93a-479452ba2d3e" />


## 所需材料与工具

KV4P HT 电路板
MagSafe 磁环
电源元器件
3D 打印外壳（如有）
工具（电烙铁等）

**本次改版的主要变更：**
- 原理图的连接关系基本保持不变。
- 将 USB 转串口芯片由 CP2102N 更换为 **CH340K**（原 CP2102N 价格更高且不易手工焊接）。
- 改进了原理图绘制风格，在页面内使用本地网络标签，取代跨页或全局端口连接。

**当前问题：**
1. 官方 Android App 尚未支持 CH340K 的 PID（Web App 则完全没问题）。
2. 外壳设计偏厚。我计划改用夹层式 SMA 连接器以减小厚度。
3. 3D 模型缺少磁珠的专用槽位，导致磁珠明显凸出，影响整体外观。

[![观看视频](https://img.youtube.com/vi/y1fTFUp0ZME/0.jpg)](https://youtube.com/shorts/y1fTFUp0ZME)

## 常见问题与解决办法

KV4P HT 不工作？
检查接线
检查 App 配置
MagSafe 未对准？
调整磁环位置
使用更强的磁铁

## 这个项目适合谁？
业余无线电爱好者
DIY 电子爱好者
Android 折腾玩家

## 结语
KV4P HT + MagSafe 让装配更简洁
轻松实现的便携电台方案
很棒的 DIY 项目

</div>
