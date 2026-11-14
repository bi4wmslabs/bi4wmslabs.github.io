---
title: "Twelve LEDs, Three Rewrites of the Indicator Language"
title_zh: "12 颗指示灯，灯语被推翻了三次"
excerpt: "The manual listed LEDs that did not exist, and two LEDs carried two meanings. The third definition finally stuck."
excerpt_zh: "手册写了不存在的灯，同一颗灯两种含义。12 颗灯的语义，被推翻了三次才定下来。"
date: 2026-11-09 20:30:00 +0800
categories: [octet, documentation]
tags: [manual, daq001, iepe, host-software]
permalink: /posts/octet-06-user-manual/
---

<span data-zh-title="12 颗指示灯，灯语被推翻了三次" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

**OCTET series** · Part 6 of 7 · [Series index](/octet-series/) · [Prev](/posts/octet-05-protocol-and-product/) · [Next →](/posts/octet-07-protocol-spec/)

The PCB reserved space for twelve channel LEDs. The first indicator table was written and immediately undone by one question from a field engineer: "the unit is recording — which LED tells me that?"

Three problems surfaced in the first week of use. The manual listed CH1 to CH12 when the board only had ten channel LEDs, so users counted the lights and concluded the firmware was wrong. CH9 and CH10 were reused for storage alarms and network status while also mirroring digital inputs, so a blinking CH9 could mean either a full disk or a signal on DI1. And STATUS carried every state through blink rates nobody was going to time with a stopwatch.

The redesign started from what a person needs to judge in thirty seconds, not from which signals exist:

- **STATUS** — heartbeat from power-on, meaning "firmware is alive", nothing more;
- **PWR** — steady power indication;
- **CH1–CH8** — one per analog channel, steady while that channel is acquiring;
- **CH9 / CH10** — a base state that mirrors DI1 / DI2, overridden by a storage-low alarm (5 Hz blink) and a network indicator (steady when connected, 5 Hz blink when lost), returning to the base state once the condition clears.

The "returning" clause mattered most: without it the light latches in the alarm state until reboot, which is worse than no alarm at all.

**The takeaway:** indicators are product semantics, not debug output. One LED, one primary meaning; reuse needs an explicit priority and a recovery path; and the documentation must match the hardware one-for-one.

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

> OCTET 系列 · 第 6 篇 / 共 7 篇 · [系列目录](/octet-series/)

硬件画板的时候留了 12 颗通道灯的位置。等软件接手，第一版灯语表写完，被现场工程师一句话问住："设备在录数据，我看哪颗灯？"——那一刻才发现，我们定义了 12 颗灯怎么亮，却没定义**人怎么用它判断状态**。

## 一、现象：灯会亮，但说不清在说什么

第一版灯语很"工程师思维"：

- 通道使能就点亮对应通道灯；
- 有故障就闪 STATUS 灯；
- 存储和网络各留一颗灯。

问题在实际使用时一个个冒出来：

**第一，手册写了不存在的灯。** 文档里列了 CH1 到 CH12，但硬件上 CH11、CH12 根本没有——PCB 只做到 10 颗通道灯的位置。用户拿到设备第一件事就是数灯，数不对就怀疑买到了次品或固件刷错了。

**第二，同一颗灯两种含义。** CH9、CH10 原本设计是接数字输入（DI1、DI2）的状态指示，但存储报警和网络状态又没地方放，于是被临时借去复用。结果是：用户在录数据时，CH9 在闪——他以为是存储报警，其实只是 DI1 有信号。

**第三，STATUS 承担了所有没说清的事。** 上电、就绪、采集中、故障、重启，全压在一颗灯上，用不同的闪烁频率区分。现场没人会拿秒表数频率。

一句话总结病根：**灯语是按"信号有没有"设计的，不是按"人要判断什么"设计的。**

## 二、分析：指示灯是产品语义，不是调试输出

把这个问题想透，需要一个视角转换：指示灯不是给开发者看寄存器的，是给现场工程师做**三十秒判断**的。

现场的真实需求只有几类：

| 人要判断的事 | 需要的表达 |
|---|---|
| 设备通电了吗、活着吗 | 静态可判，不需要计时 |
| 电源正常吗 | 静态常亮 |
| 哪几个通道在采 | 静态常亮，与通道一一对应 |
| 存储还写得进去吗 | 异常时才动，且必须一眼看出是"存储"出的问题 |
| 网络上有人连着吗 | 静态表示"已连接"，异常时闪烁 |

由此推出三条规则：

1. **一颗灯只能有一个主语义。** 复用必须有"基础态"和"覆盖态"的明确优先级，且覆盖解除后要能自己回到基础态。
2. **正常状态用静态表达，异常状态才用动态表达。** 让人扫一眼就知道"没事"，而不是盯着看闪烁节奏。
3. **文档必须和硬件一一对应。** 数不对灯，其他一切解释都不可信。

## 三、解决：10 颗通道灯，三层语义

最终定稿的灯语，按"角色"分三层：

**第一层，系统层两颗。**

- **STATUS**：上电即进心跳（约 1 Hz 呼吸），表示固件活着、调度在跑。这一颗不表达业务状态，只表达"系统没死"；
- **PWR**：电源指示，常亮。

**第二层，通道层八颗。** CH1–CH8 与模拟通道一一对应，该通道使能采集就常亮。没有 CH11、CH12——硬件不存在的东西，文档里也不许出现，LED 配置里直接删掉这两项。

**第三层，复用层两颗：CH9 = 存储报警，CH10 = 网络指示。**

这一层是全部争议的焦点，最后定的规则是"**基础态 + 覆盖态**"：

- **基础态**：CH9 跟随 DI1，CH10 跟随 DI2。数字输入有信号就亮，没有就灭——这样 4 路 DI 里有 2 路有灯可看，另 2 路（DI3、DI4）只推流不点灯；
- **覆盖态**：当 SD NAND 剩余空间不足 10 MB 时，CH9 以 5 Hz 快闪，**优先于** DI1 的跟随显示；当上位机连接时 CH10 常亮、断网则 5 Hz 快闪，**优先于** DI2；
- **恢复**：报警解除或网络恢复后，清除覆盖标志，两颗灯自动回到跟随 DI 的基础态。

关键在于"恢复"这一条。如果只做覆盖不做恢复，灯会卡在报警状态，用户重启才能消——这比不报警更糟。

## 四、结果：从"数灯"到"看灯"

改完之后，现场判断变成了几秒钟的事：

- 全灭 → 没上电，查电源；
- 只有 STATUS 心跳 → 上电了，但没在采集；
- STATUS 心跳 + 若干通道灯亮 → 正在采这几个通道；
- CH9 快闪 → 存储空间不足，去清文件；
- CH10 快闪 → 网络断了，查网线；
- CH9/CH10 稳定跟随 → 一切正常，有信号就在亮。

同时把手册里的指示灯表重写了一遍，逐颗对应实物，删掉了所有不存在的东西。这一处修正看着琐碎，却是"文档可信度"的起点——用户一旦发现文档和实物对不上，后面所有技术说明他都会打折听。

## 五、复盘：三条关于产品细节的经验

1. **功能是给机器的，语义是给人的。** 灯怎么亮是电气问题，人怎么判断是设计问题。前者实现了，后者常常没人负责。
2. **复用必须带优先级和恢复路径。** 一盏灯两种含义不可怕，可怕的是含义之间没有明确的切换规则，以及切过去回不来。
3. **文档与硬件的一一对应，是信任的基础。** 写不存在的 CH11、CH12，代价不是"改一行字"，而是让用户开始怀疑整份文档。

*下一篇：16 字节的帧头定稿前，我们删掉了 4 个字段——协议是卖给集成商的第二份产品。*

</div>
