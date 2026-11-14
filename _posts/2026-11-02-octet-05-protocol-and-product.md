---
title: "6.2 MB/s of Data and a Host UI That Stuttered"
title_zh: "6.2 MB/s 的数据流，上位机为什么卡成幻灯片"
excerpt: "Not the network: full-canvas rebuilds, per-sample Python decoding and unconditional repaints."
excerpt_zh: "数据一个不少，画面卡成 PPT。三个瓶颈叠加：全量重绘、逐样本解码、无效刷新。"
date: 2026-11-02 21:15:00 +0800
categories: [octet, firmware]
tags: [protocol, python, gui, product]
permalink: /posts/octet-05-protocol-and-product/
---

<span data-zh-title="6.2 MB/s 的数据流，上位机为什么卡成幻灯片" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

**OCTET series** · Part 5 of 7 · [Series index](/octet-series/) · [Prev](/posts/octet-04-debugging-adc-sd/) · [Next →](/posts/octet-06-user-manual/)

The device side was finally correct and the link was stable, but the waveform on screen moved like a stop-motion animation. At eight channels and 256 kSPS it nearly froze, and dragging the window locked the UI for hundreds of milliseconds. A packet capture showed every byte arriving — the problem was not transport.

Three bottlenecks were stacked on top of each other:

- **Full canvas rebuild per frame.** The original code deleted every item and recreated the curve plus grid each refresh, which means thousands of Tkinter item allocations per frame.
- **Per-sample decoding in pure Python.** Unpacking 24-bit samples in a loop handled two million iterations per second at full rate.
- **Unconditional repaints.** A timer repainted regardless of whether new data had arrived — wasteful at low rates, backlogged at high rates.

The fix was to replace "recompute everything" with "update what changed": compress each millisecond into a (min, max) envelope cell in a 1500-cell rolling window; create the 1500 line items once and move them with `coords()`; decode with numpy in one vectorised call (with a pure-Python fallback for the packaged exe); repaint only when dirty, capped at 30 FPS; and switch the frame CRC to an incremental calculation.

Measured after the rewrite: 0.089 ms to decode and enqueue one block, 8.6 ms per repaint, a steady 30 FPS at full rate.

**The takeaway:** decouple screen resolution from sample rate, keep the item count fixed and mutate it, and let data arrival drive repaints rather than a timer.

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

> OCTET 系列 · 第 5 篇 / 共 7 篇 · [系列目录](/octet-series/)

设备端的数据已经对了，网络也稳定，可屏幕上的波形像卡了帧的动画：走两步停一下，拖动窗口直接冻住。8 通道 256 kSPS 时更夸张，几乎定格。最初以为是网络不够快，抓包一看——数据一个不少，全都到了。**问题不在传输，在画图。**

## 一、现象：数据是全的，画面是断的

具体表现：

- 低采样率（4k、8k）时基本流畅；
- 32k 以上开始掉帧，256k 时几乎不刷新；
- 拖动窗口、切换标签页时明显卡死几百毫秒；
- 任务管理器里 CPU 单核跑满。

抓包确认每秒收到的字节数与理论值一致，丢包率为零。所以数据链路没问题。剩下的嫌疑只有两个：解码，和绘制。

## 二、分析：三个地方在同时拖后腿

**第一刀：每帧都在重建画布。**

原来的绘制逻辑很简单——每次刷新先 `delete("all")`，再重新 `create_line` 画一遍曲线和网格。

看起来很直观，代价是：每一帧都要销毁并重建上千个图元对象。Tkinter 的 Canvas 不是 GPU 加速的即时模式渲染，图元创建要走 Tcl 解释器、分配对象、进入显示列表。一帧上千个对象，光这一项就吃掉几十毫秒。

**第二刀：逐样本解码。**

数据是 24 bit 打包的，Python 里原来这么解：

```python
for i in range(0, len(buf), 3):
    v = buf[i] | (buf[i+1] << 8) | (buf[i+2] << 16)
    if v & 0x800000:
        v -= 1 << 24
    out.append(v)
```

一段 6 KB 的块有 2000 个样本，每秒 1000 块——就是每秒 200 万个 Python 循环。这一项单独就能把单核吃满。

**第三刀：无效刷新。**

定时器按固定间隔触发重绘，不管有没有新数据。低速采集时数据稀疏，画面却在高频重画，纯属浪费；高速时又因为重绘太慢而积压，越积越卡。

三个问题叠在一起：**每次刷新都在做全量工作，而真正变化的像素只有一点点。**

## 三、解决：把"全量重画"改成"增量更新"

**① 降采样：1500 格的包络。**

屏幕上一条 1000 像素宽的曲线，塞 256k 个采样点毫无意义——一个像素里可能挤着几百个点，画出来只是噪声。

改成每约 1 ms 压一个 `(min, max)` 包络格，滚动窗口固定 1500 格。每个格子用一条竖线表示这 1 ms 内的幅度范围，视觉上恰好是振动信号的包络形态，信息密度反而比"密密麻麻的折线"更高。

点数从"每帧几万"降到"每帧 1500"，这是数量级的变化。

**② 原地更新：`coords()` 而不是重建。**

既然格子数量固定（1500 格），图元数量也就固定。第一帧创建 1500 条线，之后每帧只调用 `coords()` 修改端点坐标——不销毁、不新建，不触发对象分配。

网格线同样处理：位置本来就不变，创建一次之后只做平移。

**③ 向量化解码。**

```python
a = np.frombuffer(buf, dtype=np.uint8).reshape(-1, 3).astype(np.int32)
v = a[:, 0] | (a[:, 1] << 8) | (a[:, 2] << 16)
v = (v ^ 0x800000) - 0x800000   # 24bit 符号扩展
```

同样的 6 KB 块，从 2000 次 Python 循环变成一次 numpy 调用。没有 numpy 环境时自动回退到纯 Python 分支，保证打包后的 exe 在任何机器上都不会崩。

**④ 脏帧才重绘 + 30 FPS 上限。**

不再"定时无条件重绘"，而是收到新数据时置脏标志，定时器到点检查：有脏数据才画，没变就跳过。同时把刷新率封顶在 30 FPS——人眼对波形滚动的感知在 30 FPS 已经饱和，再高只是烧 CPU。

**⑤ 协议解析的 CRC 改成增量计算。**

这一条不算绘制，但同样在吃 CPU：原来每解一帧都要把整个负载重新算一遍 CRC32。改成 `crc32(hdr)` 之后把前值传进去增量计算，省掉重复扫描。

## 四、结果：从"卡成幻灯片"到 8.6 ms 一帧

改完的实测数据：

| 指标 | 优化后 |
|---|---|
| 单块解码 + 入队 | 0.089 ms |
| 单帧重绘 | 8.6 ms |
| 刷新率 | 稳定 30 FPS |
| 8 通道 256k 时 CPU | 单核明显下降，界面可交互 |

8.6 ms 意味着一帧的绘制占 33 ms 预算的四分之一，剩下四分之三留给解码、协议解析和 UI 事件——**终于有余量了**。

## 五、复盘：三条关于"实时显示"的经验

1. **屏幕分辨率和数据量要解耦。** 1000 像素宽的图，画 25 万个点没有信息增益。先降采样到与像素同量级，再谈渲染效率。
2. **固定结构 + 原地更新，比"简洁的重建"快一个数量级。** 只要图元数量稳定，就不要每帧销毁重建——这是 GUI 里最容易被忽略的性能陷阱。
3. **刷新要由数据驱动，不能被定时器驱动。** "没有新数据也重画"在低速时浪费、高速时积压，是卡顿的常见成因。

*下一篇：11 颗指示灯的语义被推翻了三次——产品化里最容易被低估的一件小事。*

</div>
