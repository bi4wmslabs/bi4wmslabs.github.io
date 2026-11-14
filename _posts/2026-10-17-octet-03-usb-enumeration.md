---
title: "Every Init Returned OK, Yet the USB Device Never Appeared"
title_zh: "所有初始化都返回 OK，USB 设备却永远不出现"
excerpt: "Ten rounds of USB debugging: a missing PLL bit, a wrong endpoint direction, a cold-plug power sequence and a leaking BASEPRI."
excerpt_zh: "初始化全返回 OK，电脑上却什么都没有。十轮排查，踩遍 USB 的经典陷阱，含三个真凶。"
date: 2026-10-17 20:45:00 +0800
categories: [octet, firmware]
tags: [usb, cdc, debugging, stm32h7]
permalink: /posts/octet-03-usb-enumeration/
---

<span data-zh-title="所有初始化都返回 OK，USB 设备却永远不出现" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

**OCTET series** · Part 3 of 7 · [Series index](/octet-series/) · [Prev](/posts/octet-02-architecture/) · [Next →](/posts/octet-04-debugging-adc-sd/)

Every initialisation call returned HAL_OK. The clock tree checked out, the GPIO alternate functions were right, the descriptors looked correct, and the serial log printed "init success" eight times. Then we plugged the board in and the device manager showed nothing at all — not "unknown device", nothing, as if the cable were not connected.

The turning point was to stop reading code and build visibility instead: an LED "heartbeat" at each init stage, so the blink pattern told us how far the firmware had actually reached, plus a bisection procedure that loaded one module at a time.

Three real bugs surfaced:

- **Endpoint direction bit.** The USB endpoint address packs the endpoint number in the low nibble and the direction in bit 7. We wrote the number only, so EP0 was configured for a direction that did not exist and the SETUP packet had nowhere to land.
- **Two USB cores.** The H7 has OTG_FS and OTG_HS. Clock and PHY configured for one, endpoints initialised for the other, both returning success.
- **Cold plug.** Hot plug worked; powering up with the cable already attached did not, because the PHY reset was released before VBUS detection.

Two smaller ones cost half a day each: a callback returning early so EP0 was skipped, and a critical section that raised BASEPRI and never restored it, silently masking the USB interrupt a few seconds after boot.

**The takeaway:** a driver returning OK only means the register write was accepted. Read back the actual values, and test cold plug — the field does not unplug before powering on.

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

> OCTET 系列 · 第 3 篇 / 共 7 篇 · [系列目录](/octet-series/)

这是整个项目里最荒谬的两天：`HAL_PCD_Init()` 返回 HAL_OK，时钟配置返回 HAL_OK，中断使能也返回 HAL_OK，串口日志一行行打出来，"初始化成功"打了七八遍。然后插上电脑，设备管理器里什么都没有。不是"无法识别"，是**什么都没有**——像这根线根本没插。

## 一、现象：日志全绿，主机全黑

第一轮排查完全是按手册走的：

- 时钟树逐项对，48 MHz USB 时钟存在；
- GPIO 复用、AF 编号，对着数据手册逐个数字核对；
- 中断优先级、NVIC 使能位；
- 描述符的长度、字符串索引。

全部正确。日志里的每一句都写着成功。

这时候最容易做的一件事是**继续读代码**，读第十遍。但代码已经读不出新信息了——问题在于我们看不到设备内部到底执行到哪一步。串口能打印的只是"我以为的进度"，不是"真实的进度"。

## 二、第一步不是找 bug，是造一双眼睛

于是先停下找 bug，做了两件事：

**给设备装"LED 心电图"。** 在初始化的每个关键节点后插一句点灯/灭灯，用不同的闪烁节奏代表不同的阶段。程序跑到哪个阶段灯就停在哪，跑飞了灯就卡住。这一招把一个"看不见的黑盒"变成了能读的进度条。

**上二分法。** 每次只加载一个模块：先只跑时钟，再只跑 PCD 初始化，再加中断，再加类驱动。哪一步加上去之后设备消失了，问题就在那一步里——不再靠猜。

有了这两件工具，后面的问题才逐个现形。

## 三、第一个真 bug：端点号的方向位

日志里 EP0 的配置看起来完全正常，但用调试器读回寄存器实际值，发现端点的方向位是错的。

USB 的端点地址是 8 位：低 4 位是端点号，最高位是方向（IN/OUT）。我们按习惯写了端口号，方向位落在了错误的位置——结果 EP0 被配置成了一个不存在的方向。主机发 SETUP 包过来，设备侧没有可用的接收端点，**连枚举的第一步都没能开始**。

初始化函数一路返回 OK，因为它只检查了"写进去了没有"，没有人检查"写对没写对"。这是嵌入式里非常典型的坑：**外设驱动返回的成功，只代表寄存器写成功，不代表功能正确。**

## 四、第二个：两个 USB 核，选错了方向

STM32H7 有两个 USB 控制器：OTG_FS（全速）和 OTG_HS（高速）。板上用的是全速 PHY，但代码里同时包含了两个核的初始化路径。

问题在于：如果时钟和 PHY 配置给了 HS，而中断和端点初始化给了 FS（或者反过来），两边都能"成功"，但数据通路根本没接上。这类错误在日志里完全看不出来——两个函数都返回 OK。

判断方法很土但有效：**只保留一个核，把另一个的代码彻底注释掉**，再跑一次。如果设备出现了，就说明之前是两套代码在互相干扰。

## 五、第三个：冷插拔时才暴露的供电问题

前两个修完，热插拔（先上电，后插线）能枚举了。但断电后插上线再上电——设备又不见了。

区别在哪？热插拔时主机已经就绪，设备的 PHY 也已经稳定；冷插拔时设备先上电、后接主机，PHY 的供电和复位时序跟主机检测信号的时序对不上，主机在设备就绪前就已经放弃了检测。

修正办法是把 PHY 的上电与复位顺序按主机侧时序重排，确保复位释放发生在 VBUS 检测之后。这个问题在实验室的热插拔测试里永远测不出来，**只有现场那种"先接线再上电"的习惯才会踩到**。

## 六、尾声：两个"小"bug，各花了半天

**EP0 被跳过。** 类驱动的回调里有一处提前返回，导致 SETUP 包在某些情况下没有被处理。表现是主机能识别设备，但拿不到配置，一直停在"正在安装设备"。

**BASEPRI 泄漏。** 这是最阴的一个：某段临界区把 BASEPRI 抬高了，退出时没有恢复。此后所有低于该优先级的中断被永久屏蔽——包括 USB 中断。表现是设备工作几秒后突然消失，像"过热保护"一样规律。这种问题靠读代码几乎不可能发现，最后是在调试器里盯着 BASEPRI 寄存器值，看它什么时候变成非零才抓到。

## 七、复盘：五条 USB 调试的硬经验

1. **驱动返回 OK 不代表功能正常。** 关键外设要回读寄存器实际值，而不是信任写入函数的返回值。
2. **看不见的时候先造眼睛。** LED 心跳 + 阶段指示的成本是十分钟，价值是把"猜"变成"看"。
3. **二分法是最可靠的定位手段。** 每次只加一个模块，问题边界会自己收缩。比起通读代码，这是效率高一个数量级的办法。
4. **热插拔能过，必须测冷插拔。** 现场的用电习惯和实验室不一样，先接线后上电是最常见的操作。
5. **注意中断屏蔽位的残留。** 临界区进出必须成对，任何提前 return 都要检查是否漏了恢复——这类 bug 的表现和硬件故障极其相似。

*下一篇：USB 通了，真正的硬仗才开始——8 通道数据从 ADC 流到屏幕，中间隔着三个坑。*

</div>
