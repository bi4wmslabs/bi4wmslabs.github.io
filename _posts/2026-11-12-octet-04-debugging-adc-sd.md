---
title: "OCTET #4: Off-Frame SPI, SD Overruns and the 256 kSPS Battle"
title_zh: "OCTET 04 · 离帧协议、RX_OVERRUN 与 256 kSPS 攻坚"
excerpt: "Five deep pits between 'the chip is alive' and 'the waveform is on screen': off-frame SPI, a 1-DCLK offset, IDMA, an 8 KB stack overflow and a frame-hungry host."
excerpt_zh: "从'芯片活着'到'波形上屏'之间的五口深井：离帧 SPI、1 个 DCLK 偏移、IDMA、8KB 栈溢出与吃帧的上位机。"
date: 2026-11-12 13:00:00 +0800
categories: [octet, firmware]
tags: [spi, sdmmc, dma, debugging, ad7768]
permalink: /posts/octet-04-debugging-adc-sd/
---

<span data-zh-title="OCTET 04 · 离帧协议、RX_OVERRUN 与 256 kSPS 攻坚" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

> **OCTET series** · Part 4 of 7 · [Series index](/octet-series/) · [Prev](/posts/octet-03-usb-enumeration/) · [Next →](/posts/octet-05-protocol-and-product/)

With USB alive, the real fight began: getting 8-channel 24-bit data from the ADC onto the PC screen. Five deep pits, one story each.

## Pit 1: the AD7768 "off-frame" SPI protocol

Register reads returned 0x00 forever, while a MISO drive-probe showed the line *was* driven — the chip was alive, but speaking a language we couldn't parse.

We first assumed a plain SPI-mode problem and built a full auto-detect sweep: 8 combinations of CPOL × CPHA × frame length, with the verdict criterion upgraded from "three identical consecutive reads" to "the ID and STATUS registers must differ" (crosstalk replaying a fixed pattern off the same clock is perfectly stable, so consistency alone is unreliable). Still nothing.

Then the datasheet's *SPI Interface Details* section said it verbatim:

> "The SPI control interface uses an **off frame protocol**… Register access responses are **always offset by one CS frame**."

The response lags one full CS frame. Instruction frame and response frame are two independent CS transactions — the old code took `rx[1]` inside the instruction frame, which is always the response of the *previous* command (0x00 after reset). Fixed: frame 1 sends the command, frame 2 sends a harmless placeholder and collects the previous response. `rev=0x06` came out clean on the first try.

A batch of field-level errors fell out of the same audit against the ADI no-OS driver: POWER_MODE written into the SLEEP bit (commanding the chip to sleep), MCLK_DIV touching a reserved bit, SPI_SYNC on the wrong bit. **None of these produce errors — only wrong behavior.**

## Pit 2: SAI sampled one DCLK late

After the channel mapping was fixed, offline WAV analysis revealed that the lowest bit was **always zero** across 570k samples: SAI was sampling one DCLK after the AD7768's output — real data lived in W[24:1], values were 2× and we silently threw away 1 LSB.

Two more tricks came from the same investigation:

- The top 8 bits of each 32-bit word are a **status header**: bit7 error, bit6 filter settling, bit5 repeated data, and bits[2:0] = **channel ID**. Using it as the authoritative channel mapping (with fallback to fixed slots + a mismatch counter) gave the data path a way to prove itself.
- The stubborn "125 Hz interference" turned out to be exactly **125.00 Hz = 32000 ÷ 256** — the block rate. A comb spectrum with 0.99+ cross-channel correlation and a fixed position in every block: the DMA-interrupt → pack → TCP-burst event couples into the analog domain every 8 ms. When a periodic interference divides the sample rate, check the block rate before blaming the power rail.

## Pit 3: the SD card RX_OVERRUN storm

The moment acquisition started, every SD write failed with `FR_DISK_ERR`. HAL error 0x20 = **RX_OVERRUN**: in polling mode the SDMMC RX FIFO is 32 words deep (~10 µs at 25 MHz), and any preemption by the acquisition task or SAI interrupt overflows it, wedging the card out of the data state.

The cure: `disk_read/write` moved to the **SDMMC internal IDMA** (hardware transfers are immune to CPU latency), 3 retries + wait-for-tran between them, plus a `sdtest` command (raw 8-sector write/read compare at the card tail — separates "bad card" from "bad FatFs") and an `sd` health command. Self-test commands first: field debugging goes from folklore to two minutes.

## Pit 4: an 8 KB buffer crushed the task stack

After an upgrade the system went silent right after "SYS: ready" and rebooted 94 s later. One line from the live-trace black box said it all: `[FAULT] task stack overflow: acq`.

`cap_block_t blk` was a local variable — **8,200 bytes on a 4 KB stack**. The function prologue's `sub sp, #8200` stomped straight through into the FreeRTOS heap. Every historical "network dead, silent death" bug was this one line. The fix is one word (`static`), but the lesson is structural: `configCHECK_FOR_STACK_OVERFLOW=2` only detects after the fact and cannot prevent the overwrite. "No big buffers on stacks" must be enforced mechanically in code review.

## Pit 5: OVERRUN at 256 kSPS and the frame-hungry host

At 32 kSPS everything was stable; the fault code 7 appeared at 256 k. Three culprits, three fixes:

**Device side**: 12 ring blocks at 1000 blocks/s is 12 ms of headroom; a TCP hiccup drops blocks and the fault latched until session end. Ring deepened to 24, OVERRUN debounced over 2 s, DIO mini-frames rate-limited to one per 10 ms.

**Host side, two hidden traps**:

1. **A one-byte struct mismatch**: our `FMT_META` was 21 bytes, the device's 20 — every sample offset by one byte, so length checks and recording modulo all failed. The status frame was correct, so the UI looked healthy while the data was garbage. After the fix we added an **offline simulation test** (CRC, partial delivery, meta mapping) to pin the parser down.
2. **Threads fighting over one TCP stream**: the preview thread and the record thread both called `read_data_frame`, and the status-poll thread drained all queued DATA frames every 2 s. Refactor: a **dedicated reader thread** owns the socket; DATA/RSP/EVT go to separate queues with condition variables; `command()` only sends.

**Preview stutter**: the old renderer did `delete("all")` and rebuilt 8 × 1500-point polylines per received block — at 256 kSPS that is ~1000 full redraws of ~20k coordinates per second. Rewritten as oscilloscope-style envelope rendering: one (min,max) bucket per ~1 ms in a 1500-bucket rolling window, 30 FPS repaint of dirty frames only, `coords()` in-place updates. Measured: 0.089 ms/block decode+append, 8.6 ms/frame redraw — Tkinter can be smooth too.

## Lessons

1. Chip protocol details come from the **official driver and the manual text** — off-frame, reserved bits, timing windows;
2. Use the chip's self-describing metadata (status headers, channel IDs) so the data path can prove itself;
3. Transient faults (overruns) need **debounce + self-recovery**, never latching;
4. When interference is periodic, first check whether it divides the block/frame rate;
5. Big buffers on task stacks are the sneakiest memory corruption; a noinit trace is the last net;
6. Pin host–device structs with **offline simulation tests** — a one-byte offset is far harder to find than a crash.

*Next: part 5 — protocol design, host software and product release.*

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

> **OCTET 系列** · 第 4 篇 / 共 7 篇 · [系列目录](/octet-series/) · [上一篇](/posts/octet-03-usb-enumeration/) · [下一篇 →](/posts/octet-05-protocol-and-product/)

USB 通了之后，真正的硬仗才开始：让 8 通道 24bit 数据从 ADC 流到电脑屏幕上。这一路踩了五口"深井"，每口井都值得单独写一段。

## 井一：AD7768 的"离帧"SPI 协议

ADC 寄存器读回永远是 0x00，MISO 探测显示"线是被驱动的"——芯片活着，但说话听不懂。

最初以为是普通的 SPI 模式问题，写了一整套自适应扫描：CPOL×CPHA×帧长 8 组遍历，判据从"连读 3 次一致"升级到"ID 与 STATUS 必须不同"（同一路时钟串扰出来的固定图案每次都会重放，连读一致不可靠）。仍然全军覆没。

直到翻开数据手册的 *SPI Interface Details* 一节，原文如此：

> "The SPI control interface uses an **off frame protocol**… Register access responses are **always offset by one CS frame**."

**响应永远滞后一个 CS 帧**。指令帧和响应帧是两个独立的 CS 事务——旧代码在指令帧内取 rx[1]，读到的永远是"上一条指令的响应"，复位后恒为 0x00。修复：帧 1 发指令、帧 2 发占位指令并收上一条的响应。烧录，`rev=0x06` 干干净净地读了出来。

**教训**：ADI 官方 no-OS 驱动应作为寄存器访问的第一参考，"看起来正常的 SPI 读时序"在离帧协议下是彻头彻尾的错误。

顺手还修掉一批字段级错误：POWER_MODE 写到了 SLEEP 位（等于让芯片休眠）、MCLK_DIV 写了保留位、SPI_SYNC 写错位——**这些错误芯片不报错、只是行为不对**，只有对照官方驱动逐字段核对才能发现。

## 井二：SAI 采样偏了 1 个 DCLK

通道映射修好、5-8 通道也有数据后，离线分析 WAV 发现一个怪象：57 万个样本里最低位**恒为 0**。这意味着 SAI 比 AD7768 的输出**晚了 1 个 DCLK** 采样——真数据在 32bit 字的 W[24:1]，当前值是真值的 2 倍、白扔 1 个 LSB。

另外每通道 32bit 输出的高 8bit 是状态头：bit7=错误、bit6=滤波器未稳、bit5=重复数据、**bits[2:0]=通道号**。利用这个头做"权威通道映射"，映射不符自动回退固定槽位并计数——通道串位问题从此有了自证手段。

还有一个漂亮的定量分析案例：用户报告波形上有 125Hz 顽固干扰。对 9 秒 WAV 做频谱，梳状谱间距**严格等于 125.00Hz = 32000÷256**（块率），四通道伪影相关系数 0.99+、每块固定位置出现——这不是随机干扰，是**每 8ms 一次的"DMA 中断→打包→TCP 突发"事件在模拟域的共模耦合**。判定实验：把采样率改 16k，若梳齿间距变 62.5Hz 即证实。这类"采样率整分频"的干扰，先查块率再查电源。

## 井三：SD 卡 RX_OVERRUN 风暴

采集一开、SD 写入全是 `FR_DISK_ERR`。HAL 错误码 0x20 = **RX_OVERRUN**：SDMMC 轮询模式的 RX FIFO 只有 32 字深（25MHz 下约 10µs 写满），采集任务/SAI 中断一抢占，FIFO 溢出，卡停进 data 态，之后连环失败。

根治：`disk_read/write` 全部切 **SDMMC 内部 IDMA**，硬件搬数对 CPU 延迟免疫；失败 3 次重试 + 等卡回 tran 态；再加 `sdtest` 命令（卡尾 8 扇区原始写读比对，隔离"卡坏"与"FatFs 坏"）和 `sd` 健康命令。这一套"自检命令先行"的思路，让现场排查从玄学变成两分钟的事。

## 井四：8KB 缓冲压穿了任务栈

系统升级后出现"SYS: 就绪后日志彻底静默、94 秒后复位"。live_trace 黑匣子一行字点破：

```
[FAULT] 任务栈溢出：acq
```

`svc_acq.c` 里的 `cap_block_t blk` 是局部变量——**8200 字节压在只有 4KB 的 acq 任务栈上**，函数序言一句 `sub sp, #8200` 直接把栈踩穿，向下覆盖了 FreeRTOS 堆区。之前所有版本的"网络全废、静默死亡"，元凶都是它。

修复只需一行（改 `static`），但教训值千金：`configCHECK_FOR_STACK_OVERFLOW=2` 只能**事后**发现，防不了越界写。"大缓冲禁止上栈"必须写进编码规范并在 code review 里机械执行。

## 井五：256kSPS 下的 OVERRUN 与上位机"吃帧"

全链路打通、32kSPS 稳定运行后，用户在 256k 档位报故障码 7。三方夹击，逐一击破：

**设备侧**：环形缓冲 12 块在 1000 块/s 的块率下只剩 12ms 余量，TCP 抖动即丢块，且丢块故障锁存到会话结束。缓冲加深到 24 块 + 丢块 2 秒去抖 + DIO 小帧限流 10ms。

**上位机侧的两个暗坑**：
1. **协议结构体差 1 字节**：`FMT_META` 写成 21 字节，设备实际是 20 字节——采样数据整体错位 1 字节，长度校验、录制取模全部失败。状态帧是对的，所以界面看起来"一切正常"，就是没数据。修复后写了一个**离线仿真测试**（构造 CRC/分段到达）把协议解析钉死；
2. **线程抢流**：预览线程与录制线程共用同一条 TCP 流抢 `read_data_frame`，状态轮询线程每 2 秒还把缓冲里的 DATA 帧批量洗劫一次。重构为**专用读线程**：独占 socket，DATA/RSP/EVT 分队列 + Condition 通知，command 只发不收。

**预览卡顿**：旧实现每收到一块就 `delete("all")` 重建 8 条 ×1500 点折线，256k 下相当于每秒全量重绘 1000 次、每次 2 万个坐标。重写为示波器式包络渲染：每 ~1ms 压一个 (min,max) 格、1500 格滚动窗、30FPS 定时重绘只画脏帧、`coords()` 原地更新曲线。实测解码 + 入队 0.089ms/块、重绘 8.6ms/帧——Tkinter 也能丝滑。

## 本篇教训清单

1. 芯片协议细节以**官方驱动/手册原文**为准，离帧、保留位、时序窗口都要核对；
2. 状态头/通道号这类"芯片自带的自证信息"要用起来，让数据链路自己证明自己；
3. 异常性故障（丢块、溢出）必须**去抖 + 自恢复**，不能锁存吓用户；
4. "周期性干扰"先算它是不是块率/帧率的整分频；
5. 大缓冲上栈是最隐蔽的内存破坏，黑匣子轨迹是抓它的最后一道网；
6. 上位机与设备的结构体字段要**离线仿真测试**钉死，1 字节错位比崩溃更难查。

*下一篇：[通信协议设计、上位机工程化与产品发布](/posts/octet-05-protocol-and-product/)。*

</div>
