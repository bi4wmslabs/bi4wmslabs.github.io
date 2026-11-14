---
title: "OCTET DAQ001 · 8-Channel IEPE Acquisition Unit — Design & Debugging Notes"
title_zh: "OCTET DAQ001 八通道 IEPE 采集器 · 设计与调试实录"
permalink: /octet-series/
layout: single
---

<span data-zh-title="OCTET DAQ001 八通道 IEPE 采集器 · 设计与调试实录" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">OCTET DAQ001 · 8-Channel IEPE Acquisition Unit</p>
  <p class="bi-series-nav">Design &amp; Debugging Notes · 7 parts · Part 1 published 2026-10-01</p>
</div>

Seven field notes on **OCTET** (internal model DAQ001), an 8-channel IEPE 24-bit vibration DAQ. Each one follows the same shape: the symptom that stopped us, the analysis that found the real cause, and the fix that held.

1. **[Why We Passed on a Faster SAR ADC](/posts/octet-01-requirements/)** — simultaneous sampling, anti-alias filtering and diagnostics killed the obvious choice. · 2026-10-01
2. **[256 kSPS Kept Dropping Blocks](/posts/octet-02-architecture/)** — the fault code was real, but the bug was a 12-millisecond buffer budget. · 2026-10-08
3. **[Every Init Returned OK, the Device Never Appeared](/posts/octet-03-usb-enumeration/)** — ten rounds of USB debugging, three actual bugs. · 2026-10-17
4. **[Channel Chaos and a Stuck LSB](/posts/octet-04-debugging-adc-sd/)** — three AD7768 off-frame traps, all boundary errors. · 2026-10-26
5. **[6.2 MB/s and a UI That Stuttered](/posts/octet-05-protocol-and-product/)** — full rebuilds, per-sample decoding, unconditional repaints. · 2026-11-02
6. **[Twelve LEDs, Three Rewrites](/posts/octet-06-user-manual/)** — the indicator language is product semantics, not debug output. · 2026-11-09
7. **[Four Fields Deleted Before Freezing the Header](/posts/octet-07-protocol-spec/)** — one byte of misalignment, two days of integration. · 2026-11-14

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">OCTET DAQ001 八通道 IEPE 采集器</p>
  <p class="bi-series-nav">设计与调试实录 · 共 7 篇 · 首篇发布于 2026-10-01</p>
</div>

**OCTET**（内部型号 DAQ001）是一台 8 通道 IEPE 24bit 工业振动数据采集器。这个系列共 7 篇，每篇都按同一个套路写：**出了什么现象 → 怎么分析 → 根因在哪 → 怎么修好 → 能带走什么**。

1. **[8 通道 24bit 同步采样，为什么放弃了更快的 SAR 型 ADC](/posts/octet-01-requirements/)** —— 同步性、抗混叠、可诊断三条约束，把最直觉的选项否掉了。 · 2026-10-01
2. **[256kSPS 一开就丢块，问题不在采样率，在缓冲深度](/posts/octet-02-architecture/)** —— 一个 12 毫秒的余量，撑不住真实的调度抖动。 · 2026-10-08
3. **[所有初始化都返回 OK，USB 设备却永远不出现](/posts/octet-03-usb-enumeration/)** —— 十轮排查，三个真凶，外加两个各花半天的"小"bug。 · 2026-10-17
4. **[数据全乱、最低位恒为 0：AD7768 离帧 SPI 踩过的三个坑](/posts/octet-04-debugging-adc-sd/)** —— 三次故障，同一个病根：边界没对齐。 · 2026-10-26
5. **[6.2MB/s 的数据流，上位机为什么卡成幻灯片](/posts/octet-05-protocol-and-product/)** —— 数据一个不少，卡在全量重绘和逐样本解码上。 · 2026-11-02
6. **[12 颗指示灯，灯语被推翻了三次](/posts/octet-06-user-manual/)** —— 灯不是调试输出，是产品语义。 · 2026-11-09
7. **[16 字节帧头定稿前，我们删掉了 4 个字段](/posts/octet-07-protocol-spec/)** —— 一字节错位停了两天联调，删字段反而更好用。 · 2026-11-14

</div>
