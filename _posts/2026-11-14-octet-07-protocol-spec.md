---
title: "We Deleted Four Fields Before Freezing the 16-Byte Header"
title_zh: "16 字节帧头定稿前，我们删掉了 4 个字段"
excerpt: "A single byte of misalignment stopped a joint integration for two days. The final header is smaller and stricter."
excerpt_zh: "一个字节的错位，联调停了两天。定稿时删掉 4 个字段，协议反而更好用了。"
date: 2026-11-14 09:40:00 +0800
categories: [octet, documentation]
tags: [protocol, daq001, binary-protocol, python]
permalink: /posts/octet-07-protocol-spec/
---

<span data-zh-title="16 字节帧头定稿前，我们删掉了 4 个字段" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

**OCTET series** · Part 7 of 7 · [Series index](/octet-series/) · [Prev](/posts/octet-06-user-manual/)

The first protocol revision went out for joint integration and came back the next day: "parsing goes wrong from byte 9 onward." One byte of misalignment cost two days on both sides, and both teams believed they had implemented the document correctly.

The cause was struct padding. The header was documented as "fields in order", but a C compiler inserts padding before a 32-bit member. One side serialised the struct directly, the other packed fields by hand — same document, different bytes on the wire.

Two more problems hid behind it: the CRC covered only the payload, so a corrupted length field still passed the check and sent the parser reading out of bounds; and an 8-byte timestamp sat in every data frame, consuming 8 KB/s at a thousand frames per second while repeating the same value.

The rewrite applied one rule: a frame header exists to find the frame, know its length, and know whether it is intact. Everything else belongs in the payload. That deleted four fields — timestamp, channel mask, reserved byte and CRC16 — leaving eight fields in exactly 16 bytes: magic `0xA55A`, version, type, status, reserve, length, sequence and CRC32 covering the first 12 bytes plus the entire payload.

Two rules were made explicit: serialise field by field, never `memcpy` a struct; and compute the CRC incrementally over header then payload. The on-disk file magic `D205BIN` was deliberately left unchanged — the protocol may evolve, but recorded data must stay readable forever.

**The takeaway:** keep headers minimal and strict, cover the header with the checksum, and treat the protocol document as the second product you ship.

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

> OCTET 系列 · 第 7 篇 / 共 7 篇 · [系列目录](/octet-series/)

第一版协议发出去做联合调试，对面工程师第二天回了句话："我们按文档解析，第 9 个字节开始全乱了。" 一个字节的错位，让两边的联调停了整整两天。最后定稿的帧头是 16 字节——比第一版少了 4 个字段，却再没出现过解析分歧。

## 一、现象：文档没错，代码没错，数据就是错

最初的帧头是 20 字节，字段排得很"完整"：magic、version、type、status、保留位、负载长度、序号、时间戳、通道掩码、crc16、crc32。

问题出在联合调试的第一天：

- 我们这边的抓包工具解析完全正常；
- 对方按文档写的解析器，从第 9 个字节开始全部错位；
- 双方各自核对文档，都认为自己是按文档实现的。

真正的原因在**对齐**上。C 结构体在编译器里会自动填充（padding）以达到对齐要求，而我们文档里写的是"字段依次排列"。我们这边的 `sizeof(header_t)` 是 20，对方按字段手工累加也是 20——但内存里的实际布局里，`uint32` 前面被插了 2 个填充字节。

**同一份文档，两种实现，导出的字节流不一样。** 只要有一边用结构体直接序列化，另一边就必然错位。

这还只是第一个问题。继续查下去，发现更严重的两处：

- **CRC 只覆盖了负载**。帧头被改坏（比如长度字段被噪声翻转），CRC 校验照样通过——解析器会拿着一个错误的长度去读数据，读到越界；
- **时间戳放在帧头里**。每个数据帧都带一个 8 字节时间戳，256 kSPS 时每秒 1000 帧，光时间戳就占了 8 KB/s 的带宽，而它其实每帧都一样。

## 二、分析：帧头只该干三件事

把这些问题归拢，得到一个判断标准：**帧头的作用只有三个——认出这是我们的帧、知道后面有多长、知道有没有坏。**

除此之外的任何信息，都属于"业务数据"，应该放到负载里，而不是挤进每个帧头。

按这个标准过一遍原设计的字段：

| 字段 | 该不该在帧头 | 理由 |
|---|---|---|
| magic | 该 | 用于在字节流里找帧边界 |
| version | 该 | 协议版本，便于兼容判断 |
| type | 该 | 区分命令/响应/数据/事件 |
| status | 该 | 响应帧必须能表达成功或错误码 |
| 负载长度 plen | 该 | 没有它无法定界 |
| 序号 seq | 该 | 请求响应配对、丢帧检测 |
| CRC32 | 该 | 但必须覆盖帧头本身 |
| 时间戳 | 不该 | 每帧重复，浪费带宽；采样时间放数据帧里 |
| 通道掩码 | 不该 | 配置时确定，放 acq_cfg，不必每帧重复 |
| 保留位 | 不该 | 没有语义的字节，只会让人猜 |
| CRC16 | 不该 | 有 CRC32 就不需要第二个校验 |

数下来正好删掉 4 个字段（时间戳、通道掩码、保留位、CRC16），剩下的 8 个字段刚好 16 字节。

## 三、解决：一张能照着实现的表

最终定稿的帧头：

| 偏移 | 字段 | 长度 | 说明 |
|---|---|---|---|
| 0 | magic | 2 B | `0xA55A`，固定值，用于找帧边界 |
| 2 | version | 1 B | 协议版本 |
| 3 | type | 1 B | 0x00 RSP / 0x01 CMD / 0x02 DATA / 0x04 EVT / 0x05 DIO |
| 4 | status | 1 B | 0 成功 / 1 参数错 / 2 忙 / 3 状态错 / 4 存储错 / 7 无内存 |
| 5 | reserve | 1 B | 固定填 0，只为对齐 |
| 6 | plen | 2 B | 负载长度（不含头） |
| 8 | seq | 4 B | 序号，请求与响应用同一个值 |
| 12 | crc32 | 4 B | **覆盖帧头前 12 字节 + 整个负载** |
| 16 | payload | plen | 负载 |

三条硬规则随之定下来：

**① 序列化必须逐字段手工拼，禁止直接 `memcpy` 结构体。** 文档里明确写了"按字节序低位在前逐字段写出"，并给了 C 和 Python 两份参考实现。这一条彻底消灭了对齐分歧——两边都不依赖编译器的布局。

**② CRC 必须覆盖帧头。** 长度字段被翻转、类型字段被改坏，都要能被发现。实现上用增量计算：先算前 12 字节，再把负载喂进同一个 CRC 上下文，最后写入偏移 12。

**③ 时间戳下沉到数据帧。** 每个数据帧带一个采样起始时间，而不是每帧都带；配置类的通道掩码只在 `SET_ACQ` 里出现一次。

顺带保留了两个当时被质疑"多余"的东西：

- **UDP 5001 广播发现**：向网段广播任意包，设备回一个带 `dev_info_t` 的响应。上位机因此不需要用户输 IP，插上就能找到设备。这是整个产品"免配置"体验的根基；
- **文件头的 `D205BIN` magic 保持不变**：改它会让所有历史录制文件失效。协议版本可以迭代，但磁盘上的历史数据必须永远能读——这是对用户的承诺。

## 四、结果：17 条命令，两份实现，零分歧

定稿后协议收敛到 17 条命令，覆盖设备信息、状态、配置、采集控制、文件操作、网络与时间。C 端和 Python 端各写了一份实现，之后的联调里，解析分歧再没出现过。

更实际的收益是**联调成本**：对方工程师拿着文档和一份最小 Python 客户端（约 80 行，含 CRC 和帧解析），半天就把波形跑出来了。这在第一版是做不到的。

## 五、复盘：三条给"要交给别人用"的协议

1. **帧头只做定界和校验，业务信息进负载。** 每帧都要重复的字段，先问一句"它真的需要每帧都出现吗"。
2. **校验要覆盖帧头，序列化要手工拼。** 依赖编译器布局的协议，在跨语言、跨编译器时必然出问题；这不是"可能"，是"什么时候"。
3. **协议文档是第二份产品。** 一份能让第三方半天接通的文档，比一个功能多但要来回问的协议值钱得多。

*系列完。7 篇写下来，最想说的其实是：这些坑没有一个是"高深技术"，全部是边界、时序、余量、语义——工程的大部分难度，都在这些不起眼的地方。*

</div>
