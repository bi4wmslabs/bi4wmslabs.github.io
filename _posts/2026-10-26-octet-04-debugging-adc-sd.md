---
title: "Channel Chaos and a Stuck LSB: Three AD7768 Off-Frame Traps"
title_zh: "数据全乱、最低位恒为 0：AD7768 离帧 SPI 踩过的三个坑"
excerpt: "Scrambled channels, a lowest bit that never toggled, and a random crash — all three were boundary errors."
excerpt_zh: "通道错位、最低位恒为 0、随机死机——三次故障背后是同一个问题：边界没对齐。"
date: 2026-10-26 23:05:00 +0800
categories: [octet, firmware]
tags: [spi, sdmmc, dma, debugging, ad7768]
permalink: /posts/octet-04-debugging-adc-sd/
series: "OCTET DAQ001 八通道 IEPE 采集器"
series_no: 4
series_total: 7
---

<span data-zh-title="数据全乱、最低位恒为 0：AD7768 离帧 SPI 踩过的三个坑" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">OCTET DAQ001 · 8-Channel IEPE Acquisition Unit</p>
  <p class="bi-series-nav">Design &amp; Debugging Notes · Part 4 of 7 · <a href="/octet-series/">Series index</a> · <a href="/posts/octet-03-usb-enumeration/">← Prev</a> · <a href="/posts/octet-05-protocol-and-product/">Next →</a></p>
</div>

The AD7768 does not hand you a register read. Each frame is 32 bits: an 8-bit status header followed by 24 bits of data. Three separate failures came out of misunderstanding that frame, and each one looked completely different.

**Scrambled channels.** Channel 1's data appeared in channel 5's slot, and some channels read zero. The DMA configuration was correct; the frame boundary was not. Receiving with a 24-bit word width swallows part of the status header, and every subsequent channel shifts by one byte.

**A lowest bit that never toggled.** After fixing the mapping, 570,000 samples all had bit 0 equal to zero. A real 24-bit converter dithers in the low bits — a stuck bit means the sample is misaligned. The SAI was sampling one DCLK late, so the true value sat in W[24:1] while we read W[23:0]: every reading was doubled and the real LSB was discarded. The time-domain waveform looked perfect, which is why only a spectral check caught it.

**A random crash.** An 8 KB buffer had been declared on a FreeRTOS task stack. Stack canaries showed it had been overwritten for a while; the crash location moved whenever the optimisation level changed.

**The takeaway:** draw the frame on paper before writing the parser, assert on cheap invariants (status header channel ID, LSB dither, full-scale reading), and never put a large buffer on a task stack.

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">OCTET DAQ001 八通道 IEPE 采集器</p>
  <p class="bi-series-nav">设计与调试实录 · 第 4 篇 / 共 7 篇 · <a href="/octet-series/">系列目录</a> · <a href="/posts/octet-03-usb-enumeration/">← 上一篇</a> · <a href="/posts/octet-05-protocol-and-product/">下一篇 →</a></p>
</div>

AD7768 的输出不是“标准 SPI 读一个寄存器”那么简单。它每帧 32 位，前 8 位是状态头，后 24 位才是数据——这叫“离帧”。我们在这上面连栽三次，每一次的现象都完全不同，但根子都在同一个地方：**没有把“帧”当成一个整体去理解。**

## 一、现象一：8 个通道的数据像洗过牌

第一次跑通 SAI 接收，把 8 通道数据打出来一看：CH1 的数据出现在 CH5 的位置，CH3 和 CH7 互换，还有些通道干脆全零。

第一反应是 DMA 配置错了。查了缓冲区长度、外设数据宽度、内存增量模式，都对。又怀疑是通道映射表写错，把映射表逐项核对，也对。

真正的原因在**帧结构**上。AD7768 的两条 DOUT 线，每条按时隙轮转 4 个通道，每个时隙是 32 位：8 位状态头 + 24 位数据。而 SAI 如果按 24 位字宽去接收，就会把状态头当成数据的一部分吞掉，导致整条流的“字边界”错位——**每错一个字节，所有后续通道全部平移**，看起来就像洗过牌。

改成 32 位字宽接收，再在软件里把每个 32 位字拆成 `状态头(8) + 数据(24)`，通道立刻各归各位。

顺带一个红利：状态头里的通道号字段可以用来**校验**映射对不对。如果拆出来的通道号和预期不符，说明时序又歪了——这比事后看波形发现“数据好像不对”要早得多。

## 二、现象二：57 万个样本，最低位恒为 0

通道映射修好之后，数据看起来正常了。但把一段录制文件拖进分析工具，发现一个说不通的现象：

**57 万个样本，最低位全部是 0。**

一个正常的 24 bit ADC，噪声底会让最低几位随机跳动。最低位恒为 0 只有两种可能：要么信号被截断，要么……**根本没能采到真正的最低位**。

沿着这个线索去看位对齐，问题清楚了：SAI 采样比 AD7768 的输出**晚了 1 个 DCLK**。数据在 32 位字里的实际位置是 `W[24:1]`，而我们按 `W[23:0]` 去取。

后果是双重的：

- 数值整体变成真实值的 **2 倍**（左移了一位）；
- 真正的 LSB 被丢掉了，所以最低位永远是 0。

这个 bug 特别值得说，因为它在时域波形上几乎看不出来——波形形状完全正常，只是幅度大了一倍。**如果不是去做频谱和噪声分析，根本发现不了。** 而一旦用它做标定，所有灵敏度系数都会错一倍。

修复方式是把采样沿往前挪一个 DCLK，重新对齐帧边界。验证方法也很直接：看最低位是否开始随机跳动，以及满量程输入的读数是否回到标称值。

## 三、现象三：跑几分钟就死机，死因是 8 KB 栈

前两个修完，系统能连续出数了。但连续采集几分钟后，系统会突然复位或者卡死，位置随机，看不出规律。

抓了很久，最后是在任务栈的边界上放了哨兵值（canary），跑一段时间后检查哨兵是否被改写——结果发现某个任务的栈早被写穿了。

原因很朴素：**一个 8 KB 的缓冲被定义在了任务栈上。**

在 FreeRTOS 里，任务栈是静态分配的固定大小内存。往栈上放一个大缓冲，等于在悬崖边上盖房子：平时没事，一旦局部变量叠加、中断嵌套加深，栈指针就越界了，踩到相邻内存——可能踩到别的任务的栈，也可能踩到堆。表现就是“随机死机”，而且换个编译优化等级，现象就变。

改成静态分配（放到 `.bss` 或指定的 RAM 段），并且把“禁止在任务栈上分配大缓冲”写进编码规范。这条规范后来又被违反过一次，代价是又排查了半天。

## 四、根因：三次都栽在“边界”上

回头看，三个 bug 是同一个问题的三种表现：

| 坑 | 表面现象 | 真实原因 |
|---|---|---|
| 一 | 通道数据错位 | 字宽与帧结构不匹配，边界错位 |
| 二 | 最低位恒为 0 | 采样沿偏 1 个 DCLK，位边界错位 |
| 三 | 随机死机 | 缓冲越过栈边界 |

都不是“功能没实现”，而是“边界没对齐”。

## 五、复盘：三条防坑的具体做法

1. **先画出帧结构，再写代码。** 把 32 位里每一位属于谁画在纸上，标注状态头、数据、填充，然后让代码严格按这张图去拆。省下的不是写代码的时间，是排查错位的时间。
2. **用可验证的特征位做自检。** 状态头里有通道号，最低位应该随机跳动，满量程读数应该对得上标称值——这些都是廉价的断言，启动自检时跑一遍，比等用户发现波形不对要早得多。
3. **大缓冲永远不要放栈上。** 静态分配，并在栈边界放哨兵值做定期检查。栈溢出最恶劣的地方在于它不报错，只是让系统在某个随机时刻以一个随机的方式坏掉。

*下一篇：数据终于对了，屏幕上却卡成幻灯片——6.2 MB/s 的流，上位机该怎么画。*

</div>
