---
title: "256 kSPS Kept Dropping Blocks, and the Bug Was in Buffer Depth"
title_zh: "256kSPS 一开就丢块，问题不在采样率，在缓冲深度"
excerpt: "Fault code 7 only appeared at full rate. The link was fine; a 12-millisecond number was wrong."
excerpt_zh: "256kSPS 全开就报故障码 7，降速就好。不是带宽不够，是一个 12 毫秒的数字算错了。"
date: 2026-10-08 22:10:00 +0800
categories: [octet, firmware]
tags: [freertos, lwip, architecture, stm32h7]
permalink: /posts/octet-02-architecture/
---

<span data-zh-title="256kSPS 一开就丢块，问题不在采样率，在缓冲深度" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

**OCTET series** · Part 2 of 7 · [Series index](/octet-series/) · [Prev](/posts/octet-01-requirements/) · [Next →](/posts/octet-03-usb-enumeration/)

The scope trace was clean, but the host log kept printing fault code 7. It only appeared with all eight channels at 256 kSPS, and disappeared at 128 kSPS. The obvious reading was "not enough bandwidth" — but the failure was intermittent, not steady, and it improved when we enabled fewer channels. Bandwidth does not work that way.

So we did the arithmetic on the ring buffer instead. A block of 256 samples across eight channels is about 6 KB. At 256 kSPS the block rate is 1000 per second — one block per millisecond. The buffer was configured with 12 blocks:

```
12 blocks ÷ 1000 blocks/s = 12 ms
```

Twelve milliseconds was the entire tolerance for scheduling jitter. A single lwIP round trip, a Windows thread preemption, or one FatFs write stall can exceed that. When it does, DMA overwrites blocks that were never sent.

The fix had three parts: deepen the buffer from 12 to 24 blocks (24 ms of slack, 403 KB of RAM_D1); debounce the overrun flag over a 2-second window so a transient does not latch a permanent fault; and rate-limit digital-input frames to one per 10 ms, since bursty DI frames were competing with the data stream.

**The takeaway:** size buffers against the worst-case stall, not the average throughput. And separate "has it ever happened" counters from "is it happening now" status bits.

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

> OCTET 系列 · 第 2 篇 / 共 7 篇 · [系列目录](/octet-series/)

示波器上波形是好的，上位机日志里却在刷故障码 7。只有在 8 通道 × 256 kSPS 全开时出现，降到 128 k 就干干净净。整个系统看起来“带宽不够”，但真正的账，错在一个很多人会随手填的数字上。

## 一、现象：只有满速才报错，而且是间歇的

现场复现的条件非常明确：

- 8 通道全开、256 kSPS、以太网推流；
- 故障码 7（OVERRUN）间歇出现，几秒一次，有时几十秒才一次；
- 把采样率降到 128 k，故障消失；
- 换成只开 4 个通道，256 k 也不报错。

第一反应是“以太网跑不动 6.2 MB/s”。但这里有个细节不对劲：如果是链路带宽不够，应该是持续、稳定地丢，而不是**间歇**地丢，更不会因为通道数减少就好转——带宽是按字节算的，4 通道也是同样的机制。

间歇性说明：绝大多数时候系统是跟得上的，只是偶尔有某个环节卡了一下，而那一卡，就把数据顶出去了。

## 二、分析：把“余量”算出来

采集链路上有一段环形缓冲：ADC 通过 SAI DMA 把数据丢进缓冲块，网络任务从另一头取走发出去。缓冲块数就是这段管道的“水库容量”。

先算块的大小。8 通道 × 4 字节（24 bit 数据 + 状态头对齐）本轮 256 个采样点：

```
8 × 4 × 256 ≈ 8 KB（实际按块配置约 6 KB）
```

再算块率。256 kSPS 下，每 256 个点就是一块：

```
256 000 / 256 = 1000 块/秒
```

也就是每毫秒一块。缓冲原本配了 **12 块**——听着不少，换算成时间：

```
12 块 ÷ 1000 块/秒 = 12 毫秒
```

**整个系统的抗抖动余量，只有 12 毫秒。**

现在看另一边会发生什么：

- lwIP 发一个满包、等一个 ACK，PC 端偶尔一次调度延迟；
- Windows 上上位机的读线程被系统抢占几十毫秒；
- FatFs 在 SD NAND 上做一次擦写，偶发的写阻塞；
- 交换机在满负荷下的排队。

这些事件的量级都在十几到几十毫秒。只要其中任何一个超过 12 ms，网络任务来不及取走数据，DMA 就会覆盖还没发出去的块——OVERrun。

而 4 通道时块率不变、块变小，绝对字节数减半，链路压力小了，抖动自然减少；128 k 时块率降到 500 块/秒，12 块等于 24 ms，勉强够用。**所有现象都对上了。**

## 三、根因：缓冲深度按“平均情况”配了

问题不在采样率，也不在以太网，而在于一个很容易犯的错：**按平均吞吐去配缓冲，而不是按最坏调度延迟去配。**

12 ms 对应的是“理想情况下的余量”。真实系统里，余量应该覆盖最坏的那一次卡顿，而不是平均的那一次。

## 四、解决：24 块 + 故障去抖 + 小帧限流

**第一步：加深缓冲。** 12 块 → 24 块，余量从 12 ms 提到 24 ms。RAM_D1 占用 403 KB / 512 KB，还有余量，但已经很紧——这也是后来不敢再往上加的原因。

**第二步：故障去抖。** 加深缓冲之后偶发丢块基本消失，但极端情况下仍会有单次丢块。原来的逻辑是一丢就置故障位，结果一个瞬态抖动会让故障码常驻，用户以为设备坏了。改成：只有在最近 2 秒内确实发生过丢块才置位，2 秒内没有新丢块就自动恢复。

这一条改动看着小，实际体验差别很大——从“偶尔报错吓人”变成“只有真持续丢才报警”。

**第三步：给数字量帧限流。** 排查时发现另一个隐性消耗：DI 状态变化时会推小帧，现场有抖动信号时，这些小帧的密度可以很高，每个都要走一遍网络发送流程，和音频数据抢同一条链路。

加上 10 ms 的最小间隔限制后，DI 变化最快每 10 ms 上报一次。对干接点信号来说这个分辨率完全够，链路压力立刻下降。

## 五、复盘：三条关于“余量”的经验

1. **余量要按最坏情况算，不是按平均。** 平均 12 ms 的余量，在遇到一次 30 ms 的调度延迟时等于零。工程上应该问的是“最坏会卡多久”，而不是“通常需要多久”。
2. **间歇性故障优先怀疑共享资源，而不是能力上限。** 如果是带宽不够，表现应该是稳定的、随负载线性变化的；间歇出现往往意味着某个环节在特定时刻阻塞了。
3. **故障判据要区分“发生过”和“正在发生”。** 累计计数适合做统计，实时状态位必须带时间窗口，否则一次瞬态会让告警永久挂在那里。

*下一篇：所有初始化都返回 OK，USB 设备却在电脑上永远不出现——十轮排查，踩遍了 USB 的经典陷阱。*

</div>
