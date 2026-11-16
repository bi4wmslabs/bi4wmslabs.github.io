---
title: "From an LED Board to a Chinese Word Clock — Build & Debugging Notes"
title_zh: "从一块灯板到一台中文字钟 · 开发调试手记"
permalink: /wordclock-series/
layout: single
---

<span data-zh-title="从一块灯板到一台中文字钟 · 开发调试手记" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">From an LED Board to a Chinese Word Clock</p>
  <p class="bi-series-nav">Build &amp; Debugging Notes · 7 parts · Part 1 published 2026-11-10</p>
</div>

Seven notes on a second-development project: an ESP8266 word clock based on the open-source [Multilayout-ESP-Wordclock](https://github.com/ESPWortuhr/Multilayout-ESP-Wordclock) 5.0.0. Version one was hardware — an 11×10+4 LED board, an acrylic printed panel, and a light-blocking support plate. Version two brought Chinese to the firmware, and the blank cells on the Chinese panel became weekday, weather and temperature.

Every part follows the same shape: the symptom that stopped me, the analysis that found the real cause, and the fix that held.

1. **[From an LED Board to a Chinese Word Clock](/posts/wordclock-00-prologue/)** — the open-source base, three stacked boards, and why the blank cells had to be filled. · 2026-11-10
2. **[Two Dead Rows](/posts/wordclock-01-weather-rows-dark/)** — one invariant moved the fault from the display to the data layer. · 2026-11-11
3. **[TCP Connects, No Response Ever Arrives](/posts/wordclock-02-half-connected-network/)** — a 248 ms handshake, then silence: testing a half-connected link. · 2026-11-12
4. **[TLS and 6 KB of JSON in a 30 KB Heap](/posts/wordclock-03-tls-gzip-30kb-heap/)** — MFLN, disconnect-then-inflate, byte-level verification. · 2026-11-13
5. **[`wdt reset` on Boot](/posts/wordclock-04-boot-loop-heap/)** — static init, DNS timeout, and why `getFreeHeap()` lies. · 2026-11-14
6. **[One Degree on a Chinese Word Clock](/posts/wordclock-05-one-degree/)** — superstring glyphs, row 9, and a scripted check of the printed film. · 2026-11-15
7. **[Just Type a City](/posts/wordclock-06-keyless-city/)** — keyless weather, one-field configuration, and the `zh-CN` trap. · 2026-11-16

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">从一块灯板到一台中文字钟</p>
  <p class="bi-series-nav">字钟开发调试手记 · 共 7 篇 · 首篇发布于 2026-11-10</p>
</div>

基于官方开源项目 **[Multilayout-ESP-Wordclock](https://github.com/ESPWortuhr/Multilayout-ESP-Wordclock) 5.0.0** 二次开发的七篇记录。第一版做硬件——11×10+4 的 LED 灯板、亚克力丝印板、隔光支撑板；第二版把固件改成支持中文，中文面板上的空白格则变成了星期、天气和温度。

每篇都按同一个套路写：**出了什么现象 → 怎么分析 → 根因在哪 → 怎么修好 → 能带走什么**。

1. **[从一块灯板到一台中文字钟](/posts/wordclock-00-prologue/)** —— 开源底座、三层硬件，以及那些必须被填上的空白格。 · 2026-11-10
2. **[天气两行全灭](/posts/wordclock-01-weather-rows-dark/)** —— 一条判据，把故障从显示层搬到数据层。 · 2026-11-11
3. **[TCP 连得上，却永远等不到响应](/posts/wordclock-02-half-connected-network/)** —— 248 毫秒握手之后是十秒静默：怎么测一条「半连通」的链路。 · 2026-11-12
4. **[在 30 KB 堆里装下 TLS 和 6 KB JSON](/posts/wordclock-03-tls-gzip-30kb-heap/)** —— MFLN 压缩记录、先断连再解压、PC 端字节级验证。 · 2026-11-13
5. **[开机就 `wdt reset`](/posts/wordclock-04-boot-loop-heap/)** —— 静态初始化、DNS 超时，以及 `getFreeHeap()` 为什么骗人。 · 2026-11-14
6. **[让中文字钟精确到 1℃](/posts/wordclock-05-one-degree/)** —— 字模「超串」、第 9 行的启用，以及用脚本校验丝印。 · 2026-11-15
7. **[只填一个城市](/posts/wordclock-06-keyless-city/)** —— 免 key 天气源、单字段配置，和 `zh-CN` 落回英文的坑。 · 2026-11-16

</div>
