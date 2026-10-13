---
title: "Debugging the Power Stage"
title_zh: "功率级调试笔记"
excerpt: "How I traced a gate-drive ringing problem back to layout."
excerpt_zh: "我如何把一处栅极驱动振铃问题追查到 PCB 布局上。"
date: 2026-10-15
categories: [notes]
tags: [power, layout, debugging]
read_time: true
comments: false
---

<!-- 页面大标题的中文 -->
<span data-zh-title="功率级调试笔记" hidden></span>

<div class="bi-lang-en" markdown="1">

## The symptom

The half-bridge showed about 8 V of ringing on the gate at every switching
edge, well above what the driver datasheet allows.

## The measurement

Probing with a spring ground clip rather than the long alligator lead cut the
observed ringing in half — so half of what I saw was measurement artifact.

## The real cause

The remaining ringing traced to the loop formed by the bootstrap capacitor and
the high-side gate resistor. Moving both parts 4 mm closer to the driver cut
the loop area by roughly 60%.

## Takeaway

Measure with the right probe first. Only then start changing the layout.

</div>

<div class="bi-lang-zh" markdown="1">

## 现象

半桥在每个开关沿上都能看到约 8 V 的栅极振铃，明显高于驱动芯片数据手册
允许的范围。

## 测量

改用接地弹簧而非长鳄鱼夹线后，观测到的振铃减少了一半——也就是说，
我看到的问题有一半是测量方法引入的假象。

## 真正的原因

剩余的振铃追查到由自举电容与高边栅极电阻构成的回路。把这两个元件
向驱动芯片挪近 4 mm 后，回路面积缩小约 60%。

## 小结

先用正确的探头测量，确认问题真实存在，再动手改版图。

</div>
