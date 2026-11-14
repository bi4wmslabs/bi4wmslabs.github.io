---
title: "Why We Passed on a Faster SAR ADC for 8-Channel 24-bit Sampling"
title_zh: "8 通道 24bit 同步采样，为什么最后放弃了更快的 SAR 型 ADC"
excerpt: "SAR is faster and cheaper — so why did the design land on a delta-sigma part? Three constraints decided it."
excerpt_zh: "SAR 更快、更便宜，为什么最后选了 Σ-Δ？把 8 通道同步、抗混叠、可诊断三条约束算清楚，答案就变了。"
date: 2026-10-01 21:30:00 +0800
categories: [octet, firmware]
tags: [requirements, architecture, stm32h7, ad7768]
permalink: /posts/octet-01-requirements/
---

<span data-zh-title="8 通道 24bit 同步采样，为什么最后放弃了更快的 SAR 型 ADC" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

**OCTET series** · Part 1 of 7 · [Series index](/octet-series/) · [Next →](/posts/octet-02-architecture/)

We opened the third selection meeting with three datasheets on the table, and everyone assumed SAR. It is fast, cheap, and has no group delay — the default answer for high-speed acquisition. The part we shipped is a delta-sigma converter.

The requirement looked simple: eight IEPE channels, 24-bit, up to 256 kSPS each, sampled simultaneously. In bandwidth terms that is 8 × 256k × 3 bytes ≈ 6.1 MB/s, which already consumes most of a 100 Mbit link.

Three things killed the SAR path:

- a multiplexed front end cannot sample eight channels at the same instant, which breaks every phase measurement;
- each channel needs its own anti-alias filter, and eight of them must match each other;
- a bare SAR tells software nothing about saturation or a disconnected sensor.

The AD7768 answered all three: true simultaneous sampling, built-in anti-alias filtering, and an 8-bit status header per channel. One bonus we appreciated only later — its data port drives the STM32 SAI peripheral directly in slave DMA mode, so the CPU never touches the samples. When we later fought for a stable 256 kSPS, that path was the only link that never became a bottleneck.

We also deleted two parts on the same logic: an external EEPROM and a NOR flash both became redundant once the MCU's dual-bank flash and the on-board SD NAND were in the design.

**The takeaway:** write the core requirement as one sentence before reading datasheets, and count the external support cost — filters, buffers, diagnostics — not just the chip price.

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

> OCTET 系列 · 第 1 篇 / 共 7 篇 · [系列目录](/octet-series/)

选型会开到第三次，桌上摊着三份 ADC 规格书。所有人都觉得应该选 SAR——它快、便宜、没有群延迟，是“高速采集”的默认答案。最后定下来的却是 Σ-Δ。这篇记录那次论证怎么推翻直觉的。

## 一、现象：8 个通道一起采，数据量先把人吓住了

需求很朴素：8 通道 IEPE，24bit，单通道最高 256 kSPS，同步采样。

把这句话翻译成带宽，是第一个让人清醒的时刻：

```
8 通道 × 256k SPS × 3 字节 = 6.14 MB/s
```

加上帧头、时间戳和状态字节，实际推流约 6.2 MB/s。这个数字意味着两件事：

- 百兆以太网的理论上限 12.5 MB/s，实际能跑 8~9 MB/s，**刚刚够，几乎没有余量**；
- 板载存储必须跟得上 6 MB/s 的持续写入，而且不能出现毫秒级的写阻塞。

再看市面上的现成方案，两头都不合适：

- **台式采集卡**：通道多、指标高，但价格贵、体积大、绑死在工控机上，没法挂到设备旁边做分布式部署；
- **简易记录仪**：便宜，但采样率、位深、同步性都不够，通常还不能联网。

中间那块空地，就是我们要占的位置。但“占中间”不构成选型依据——真正决定 ADC 的，是下面三个约束。

## 二、分析：SAR 在这三个地方会塌

SAR 型的优势是公认的：转换快、延迟低、单通道吞吐高。问题是它的优势建立在“分时复用”上，而我们恰恰不要分时。

**第一刀：同步性。**

高速多通道 SAR 的常规做法是前面挂多路复用器，逐通道轮流转换。8 个通道分时采样，意味着通道之间天然存在固定时差——一个 256 kSPS 的 8 通道系统，相邻通道最大时间差可以到微秒级。

对振动监测来说这是致命的。测相位、做互相关、算通道间的传递函数，全都建立在“同一时刻”这个前提上。分时采样的数据在时域上就是错的，后期怎么补都补不回来。要真同步，就得 8 片 SAR 并排 + 8 套采样保持，成本和布板面积立刻翻倍。

**第二刀：抗混叠。**

SAR 前面必须有模拟低通滤波器，否则高频分量会折叠进带内，而且折叠后无法区分。256 kSPS 的采样率，抗混叠截止点要压到 100 kHz 附近，还得有足够陡的滚降。

8 个通道就是 8 套滤波器。每套至少二阶、精密阻容、通道间要匹配——一致性稍有差异，通道间的幅频响应就对不齐。更麻烦的是，这些滤波器占的 PCB 面积比 ADC 本身还大，而模拟前端的布局稍有不慎，噪声就上来了。

**第三刀：状态信息。**

工业现场最怕的不是“数据不准”，而是“数据不准但你不知道”。传感器断线、超量程饱和、通道接错，如果 ADC 只吐纯净样本，这些异常只能靠软件猜。

SAR 方案里，这些都得靠外部电路加 MCU 的 ADC 去监测，又是一轮通道、又一轮校准。

## 三、根因：我们要的不是“快”，是“同步且可诊断”

把三轮讨论压成一句话：**这个产品的核心指标不是单通道速度，而是 8 个通道在同一时刻的、带状态标记的、不需要外部模拟前端配合的数据。**

这句话一写下来，选型逻辑就变了。不是在比谁的转换时间短，而是在比谁能让整条链路更短。

## 四、解决：Σ-Δ + 内置抗混叠 + 直连 SAI

最终选的 AD7768BSTZ，恰好把这三点都接住了。

**同步性**：8 通道真正同时采样，每个通道独立的 Σ-Δ 调制器，共享同一时钟。通道间没有时差这个变量，后面所有相位相关的算法都不需要修正。

**抗混叠**：滤波器内置。这一条省掉的不只是 8 套阻容——整块模拟前端的布局压力、通道一致性校准、以及由此带来的噪声耦合风险，全部消失了。板上留给 IEPE 偏置和保护的面积一下子宽裕起来。

**可诊断**：每通道数据自带 8 bit 状态头，包含通道号、饱和标志、错误标志。软件拿到的不是一个裸样本，而是“样本 + 它当时的状态”。传感器断了、通道接错了、信号顶到满量程了，固件立刻知道，不用等用户发现波形不对。

还有一个当时没意识到、后来救了整个项目的红利：

AD7768 的数据口可以直接接 STM32H753 的 **SAI** 外设做从机 DMA 接收。两条 DOUT 线（每线 4 个通道时隙）就能把 8 通道数据搬完，CPU 全程不参与。等到后面攻 256 kSPS 吞吐时，这条硬件通路是唯一没有成为瓶颈的环节。

## 五、顺带砍掉的两颗芯片

同一个逻辑还砍掉了两个原有设计：

- **AT24C128C（EEPROM）**：参数存储只有几 KB，MCU 内部 FLASH 的双 bank 完全够用，还能省掉 I2C 走线和一颗器件；
- **W25Q128（NOR Flash）**：原计划用来存日志和配置备份，但板载 SD NAND 已经把文件系统包了，再加一颗纯属重复投资。

选型不是“往上加”，很多时候是“敢删”。每删一颗器件，就少一条失效路径、少一份 BOM 成本、少一个现场排查时要想的变量。

## 六、复盘：三条能带走的选型原则

1. **先写清楚“核心指标是哪一句话”，再去看规格书。** 指标没冻结时，任何参数都能找到支持它的器件；一旦写成一句话，不合适的会自己出局。
2. **把“外部配合成本”算进选型。** SAR 便宜，但它要求 8 套模拟前端、8 套滤波器、额外的状态监测电路——这些都要面积、要调试、要一致性校准。单看芯片价格会得出完全相反的结论。
3. **优先选“把问题在芯片内解决”的方案。** 内置抗混叠、内置状态头，本质是把系统级难题收敛到一颗器件里。对中小团队，这比省几块钱重要得多。

*下一篇：选型定完、代码写完，8 通道 256k 一跑就报故障码 7——账算错在一个缓冲深度上。*

</div>
