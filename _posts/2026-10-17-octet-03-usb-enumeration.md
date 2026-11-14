---
title: "OCTET #3: Ten Rounds of USB CDC Enumeration Debugging"
title_zh: "OCTET 03 · USB 虚拟串口的十轮攻防"
excerpt: "Every classic USB trap in one story: a missing PLL output-enable bit, EP0 skipped, cold-plug PHY power, and a leaking BASEPRI."
excerpt_zh: "一个故事集齐 USB 经典陷阱：PLL 输出使能位缺失、EP0 被跳过、冷插拔 PHY 供电与 BASEPRI 泄漏。"
date: 2026-10-17 20:45:00 +0800
categories: [octet, firmware]
tags: [usb, cdc, debugging, stm32h7]
permalink: /posts/octet-03-usb-enumeration/
---

<span data-zh-title="OCTET 03 · USB 虚拟串口的十轮攻防" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

> **OCTET series** · Part 3 of 7 · [Series index](/octet-series/) · [Prev](/posts/octet-02-architecture/) · [Next →](/posts/octet-04-debugging-adc-sd/)

The first lifeline of the device is the USB virtual COM port — all logs and the diagnostic shell depend on it. This "standard peripheral" cost us two days and ten rounds of debugging, and the story collects almost every classic USB trap.

## Rounds 1–4: every call returns OK, but the device never appears

DFU worked, the heartbeat LED worked, `HAL_PCD_Start` returned OK — yet no COM port in Device Manager.

The decisive find: this HAL's `RCC_OscInitTypeDef` only supports PLL1. Our USB 48 MHz came from PLL3, configured via raw CMSIS macros — and we **forgot the output-enable bits `DIVP3EN/DIVQ3EN`** (reset value 0).

So PLL3 locked, every init function returned success, the heartbeat kept beating — but the USB kernel clock was 0, the OTG PHY never drove the D+ pull-up, and the host physically saw nothing. **Between "all calls succeeded" and "the hardware works" sits a single register bit.**

Fix plus a new discipline: read back critical clock registers after configuration (USBSEL / PLL3ON / DIVQ3EN). Never trust return values.

## Rounds 5–6: an "LED ECG" for enumeration

You cannot see an enumeration on a scope, so we turned the process into LED codes: CH3 = boot done, CH2 = USB IRQ toggle, CH4 = bus reset received, CH5 = SETUP received, CH6 = EP0 data sent — later upgraded to **latching LEDs** for hardware self-test failures (wrong GSNPSID signature, transceiver unpowered, DCTL.SDIS stuck). The user films the LEDs with a phone; we decode frame by frame. We eventually wrote an OpenCV script to track LED blobs and decode morse frames automatically — **when no serial port is available, a camera is your logic analyzer.**

## Round 6: the endpoint-number direction bug

A textbook porting error: this `usbd_core.c` checks EP0 with the bare number `if (epnum == 0)`, while our callbacks passed `epnum | 0x80` — the convention of a *different* ST library generation. EP0 control transfers were skipped entirely: enumeration could never succeed. HAL-side masking with `ep_addr & EP_ADDR_MSK` makes both conventions compatible.

## Rounds 7–8: two USB cores, the wrong direction

The H743 has two USB cores and PA11/PA12 route to both. Because "the ROM DFU enumerates" we briefly switched to OTG1_HS — until RM0433 said verbatim: *"USB OTG FS in Device mode (DFU) on pins PA11/PA12."* The DFU runs on OTG_FS. Lesson: **nail down inferences with manual text, not with "it happens to work."**

## Round 9: attached, but "device not recognized"

The LEDs showed bus reset received and all self-tests passing; Windows said "USB device not recognized" — attach and reset fine, data phase corrupt. Prime suspect: 48 MHz accuracy. The user decided not to gamble on the crystal: switch to **HSI48 + CRS**, which trims the factory ±1% RC against USB SOF frames to the required ±0.25%. (Our earlier worry about CRS was wrong: the host starts sending SOF right after bus reset, so the calibration loop closes immediately.)

**The minimal-context method** broke the deadlock: an `LED_TEST_ONLY` firmware (no RTOS, no peripherals, just LEDs + "hello world") enumerated at once — so the bug was in the interaction between the full firmware environment and the USB stack.

## Bisecting: load one module at a time

Full-firmware init was split into six stages (log → clock → MPU → Cache → GPIO → drivers), toggled by a build switch, with a noinit USB event recorder printed on the next boot. Two bisection rounds exposed the **BASEPRI leak**:

> This CM7 port initializes `uxCriticalNesting` to `0xaaaaaaaa` and only zeroes it in `xPortStartScheduler`. Any FreeRTOS API called before the scheduler (task creation, lwIP pool allocation…) leaves the enter/exit critical-section pair unbalanced → `portENABLE_INTERRUPTS` never runs → **BASEPRI sticks at 0x50 and silently masks every interrupt with priority ≥ 5**. That is how the ETH interrupt "disappeared" (it returns in part 4).

## Cold plug: the sneakiest battle

Warm reset always worked; **a cold power-up failed to enumerate 8 times out of 10**. The USB event recorder gave the hard evidence: `ev_count=0xFF` — not a single USB interrupt, not even SOF.

Root cause: the project **never called `HAL_PWREx_EnableUSBReg()`**. The H7's internal USB 3.3 V regulator (`PWR->CR3` USBREGEN/USB33DEN) was never enabled, so the PHY analog front-end was dead and the D+ pull-up never drove. And a system reset does not reset the PWR domain — the regulator's output capacitor stays charged, the PHY is instantly ready — **that is the entire story of "warm reset fine, cold start broken."**

After the fix, two follow-ups:

1. `EnableUSBReg` busy-waits up to 1 s on `USB33RDY`, which is permanently 0 on this board (VDD33USB is externally supplied) → 3 × 2 s of wasted waiting = the mysterious 10-second enumeration. Fixed by setting the CR3 bits ourselves with a 50 ms bounded probe.
2. The self-healing criterion `ev_count == 0` never fires after a descriptor failure (the device does get interrupts) — **that is why the user always had to press the reset button.** Criterion changed to `dev_state != CONFIGURED/SUSPENDED`, self-heal every 2.5 s.

Final scheme: a deterministic "stabilize first, attach later" sequence — wait 1.5 s on cold power-up, defer `USBD_Start` to control the pull-up moment, then up to 5 fast reconnect rounds.

## Epilogue: two "small" bugs

Weeks later, two more: concurrent log writers (tasks + USB ISR) deadlocked the CDC transmit state machine → fixed with a critical section, a 200 ms busy-timeout self-heal and a bottom-half pump; and the RX buffer aliased onto the command-line accumulator, so every USB packet overwrote accumulated characters — typing "ver" letter by letter left "er" on the line. Fixed with a separate packet buffer, echo, backspace and a prompt.

## Lessons

1. Never trust init return values — **read back critical registers**;
2. When porting USB class libraries, first verify the **endpoint-number convention** (bare vs `|0x80`) and library generation;
3. "It happens to work" is not evidence (OTG_FS vs OTG1_HS) — quote the manual;
4. Warm reset ≠ cold start: **PWR/clock domains do not reset**;
5. With no serial port, LED codes + noinit black box + frame-by-frame camera analysis are your instruments;
6. Bisection + minimal-context firmware turns "black magic" into reproducible evidence.

*Next: part 4 — off-frame SPI, SD overruns and the 256 kSPS battle.*

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

> **OCTET 系列** · 第 3 篇 / 共 7 篇 · [系列目录](/octet-series/) · [上一篇](/posts/octet-02-architecture/) · [下一篇 →](/posts/octet-04-debugging-adc-sd/)

设备的第一条调试命脉是 USB 虚拟串口——日志、命令行全靠它。然而这个"标准外设"折磨了我们整整两天，前后十轮排查。把这段过程写下来，是因为它集齐了 USB 调试中几乎所有的经典陷阱。

## Round 1–4：所有初始化都返回 OK，设备却不出现

现象很诡异：DFU 下载正常，固件心跳正常，`HAL_PCD_Start` 返回 OK，设备管理器里就是没有 COM 口。

**决定性发现**：本工程的 HAL 版本里，`RCC_OscInitTypeDef` 只支持 PLL1。而 USB 48MHz 时钟来自 PLL3——我们用 CMSIS 寄存器宏手配 PLL3 时，**漏置了输出使能位 `DIVP3EN/DIVQ3EN`**（复位值是 0）。

于是：PLL3 锁定、一切初始化函数正常返回、心跳灯照跳——但 USB 内核时钟恒为 0，OTG PHY 没有 DP 上拉驱动，主机物理上就看不到任何设备。**"所有调用都成功"与"硬件在工作"之间，隔着寄存器的一个位。**

修复后顺手加了一道防线：时钟配置后**回读寄存器自检**（USBSEL/PLL3ON/DIVQ3EN），不再相信函数返回值。

## Round 5–6：给设备装上"LED 心电图"

看不见枚举过程，就把过程变成灯语：

- CH3 = 启动完成、CH2 = USB 中断翻转、CH4 = 收到总线复位、CH5 = 收到 SETUP、CH6 = EP0 数据已发出；
- 后期升级为**锁存灯**：硬件自检失败（GSNPSID 签名错 / 收发器未上电）、DCTL.SDIS 未清，各自锁存常亮。

用户拍一段手机视频发过来，我们逐帧分析亮灭序列就能读出状态。后来甚至写了 OpenCV 脚本自动跟踪 LED 亮斑、解码摩尔斯帧——当串口不可用时，摄像头就是示波器。

## Round 6 的确凿 bug：端点号方向位

在代码审查里抓到一个教科书级移植错误：我们用的这版 `usbd_core.c` 判断 EP0 用裸端点号 `if (epnum == 0)`，而移植来的回调却传 `epnum | 0x80`（这是 ST 另一代库的约定）。EP0 控制传输被整体跳过——**枚举必然失败**。HAL 层用 `ep_addr & EP_ADDR_MSK` 掩码后，两种写法兼容。

## Round 7–8：两个 USB 核心，选错方向白忙一场

H743 有两个 USB 核心，PA11/PA12 同时路由到 OTG_FS 和 OTG1_HS。因为"ROM bootloader 的 DFU 能枚举"，我们一度切到 OTG1_HS——直到翻出 **RM0433 原文**："USB OTG FS in Device mode (DFU) on pins PA11/PA12"。DFU 走的是 OTG_FS，方向反了，切回。教训：**推断要用手册原文钉死，不能用"能跑通"的现象反推**。

## Round 9：主机检测到设备了，但"无法识别"

灯语显示总线复位已收到、自检全过，Windows 报"无法识别的 USB 设备"——附件与复位成功，数据阶段损坏。此时最高嫌疑是 48MHz 频偏。用户拍板：不赌晶振，改用 **HSI48 + CRS**（时钟恢复电路拿 SOF 自动校准，出厂 ±1% 校到 USB 要求的 ±0.25%）。之前对 CRS 的担忧是误判：总线复位后主机立刻发 SOF，校准链即刻闭环。

**最小上下文法**成了破局关键：写一个 `LED_TEST_ONLY` 极简固件（无 RTOS、无外设、只点灯 + 发 hello world），USB 一次枚举成功 → 问题锁定在"完整固件环境与 USB 栈的相互作用"。

## 二分定位：每次只加载一个模块

把完整固件的初始化拆成 6 个阶段（log → clock → MPU → Cache → GPIO → 各驱动），用编译开关逐级加载。USB 事件记录仪写进 noinit RAM，每次启动把上次的事件序列打出来。两轮二分后锁定了 **BASEPRI 泄漏**：

> 本工程 CM7 移植的 `uxCriticalNesting` 初值是 `0xaaaaaaaa`，只在 `xPortStartScheduler` 里归零。调度器启动前任何 FreeRTOS API（建任务、lwIP 内存池分配……）的 enter/exit 临界区对都回不到 0 → `portENABLE_INTERRUPTS` 永不执行 → **BASEPRI 卡在 0x50，优先级 ≥5 的全部中断被静默屏蔽**。ETH 中断就是这么"消失"的（第 4 篇还会再见它一次）。

## 冷插拔：最隐蔽的一战

软复位一切正常，**冷上电（拔电再插）却 10 次里 8 次不出设备**。USB 事件记录仪给出铁证：`ev_count=0xFF`——冷启动后 USB 中断一次都没发生，连 SOF 都没有。

根因：工程里**从未调用 `HAL_PWREx_EnableUSBReg()`**。H7 内部 USB 3.3V 稳压器（`PWR->CR3` 的 USBREGEN/USB33DEN）从未使能，PHY 模拟前端不工作，DP 上拉不驱动。而系统复位不复位 PWR 域——稳压器输出电容还带着电，PHY 立即就绪——**这就是"软复位好、冷启动坏"的全部原因**。

修复后又追出两个次生问题：

1. `EnableUSBReg` 内部固定等 `USB33RDY` 1 秒，而这块板 VDD33USB 实为外部供电，RDY 恒 0 → 白等 2 秒 ×3 次 = 枚举要 10 秒。改为自置寄存器位 + 50ms 限时探测；
2. 自愈判据用 `ev_count==0`，而"描述符请求失败"后设备是有中断的——**永远不触发重试**，这就是用户"必须按复位键"的直接原因。判据改为 `dev_state != CONFIGURED/SUSPENDED`，每 2.5 秒自愈。

最终方案是"先稳定、后挂总线"的确定性时序：冷上电等 1500ms → 推迟 `USBD_Start` 控制上拉时刻 → 上电后最多 5 轮快速重连。

## 尾声：两个"小"bug

十轮攻防结束、CDC 稳定运行数周后，又抓到两个后患：

- **日志冻死**：多任务 + USB ISR 并发写日志、无互斥，把 USB 发送状态机卡死在 BUSY → CDC 永久静音。修复：临界区保护 + 200ms 忙超时自愈 + 兜底泵；
- **交互无反应**：USB 接收缓冲直接别名到命令行累加缓冲，每个 USB 包都从头覆盖累积的字符——逐字输入"ver"，命令行里躺着的是"er"。修复：独立包缓冲 + 回显 + 退格 + 提示符。

## 本篇教训清单

1. 永远不要相信初始化函数的返回值，**关键配置后回读寄存器**；
2. 移植 USB 类库先核对**端点号约定**（裸号 vs `|0x80`）与库代次；
3. "现象能跑通"不能作为选型依据（OTG_FS/OTG1_HS），查手册原文；
4. 软复位 ≠ 冷启动，**PWR/Clock 域不复位**是隐藏变量；
5. 无串口可用的现场，LED 灯语 + noinit 黑匣子 + 摄像头逐帧分析，就是你的示波器和逻辑分析仪；
6. 二分法 + 最小上下文固件，是把"玄学"变"实证"的唯一路径。

*下一篇：[离帧协议、SD 卡 RX_OVERRUN、8KB 栈溢出与 256kSPS 的吞吐攻坚](/posts/octet-04-debugging-adc-sd/)。*

</div>
