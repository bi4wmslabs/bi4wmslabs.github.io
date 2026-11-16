---
title: 'TLS and 6 KB of JSON in a 30 KB Heap'
title_zh: "03｜在 30 KB 堆里同时装下 TLS 和 6 KB JSON"
excerpt: 'BearSSL wants 16 KB before the handshake. MFLN, disconnect-then-inflate, and a byte-level check on the PC.'
excerpt_zh: "BearSSL 默认缓冲一开就是 16 KB。MFLN 压缩记录、先断连再解压，以及一次 PC 端字节级验证。"
date: 2026-11-13 20:00:00 +0800
categories: [wordclock, firmware]
tags: [word-clock, esp8266, tls, gzip, memory]
permalink: /posts/wordclock-03-tls-gzip-30kb-heap/
series: "从一块灯板到一台中文字钟"
series_en: "From an LED Board to a Chinese Word Clock"
series_no: 4
series_total: 7
---

<span data-zh-title="03｜在 30 KB 堆里同时装下 TLS 和 6 KB JSON" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">From an LED Board to a Chinese Word Clock</p>
  <p class="bi-series-nav">Word Clock Build Notes · Part 4 of 7 · <a href="/wordclock-series/">Series index</a> · <a href="/posts/wordclock-02-half-connected-network/">← Prev</a> · <a href="/posts/wordclock-04-boot-loop-heap/">Next →</a></p>
</div>

*Previously: the problem was pinned on the link, and the decision was to change the source — from HTTP to HTTPS. The handshake succeeded, and the very next limit was physical: with TLS enabled, 30 KB of heap is not enough.*

## The symptom

After switching to QWeather, authentication, path and TLS all worked. The failure moved to the last step:

```
TLS connected to xxxxxx.re.qweatherapi.com in 544 ms (heap 10544, small buffers, MFLN 1)
QWeather sent a gzip compressed body, cannot parse it
```

Handshake fine, 10 KB of heap left, but the body is gzip — ArduinoJson cannot read a binary stream.

## Investigation

**Ask the server not to compress.** Three attempts, all refused: `Accept-Encoding: identity` ignored, the legacy `&gzip=n` parameter ignored, plain HTTP on port 80 closed. The decisive observation: even a 150-byte `403` error document came back gzip-encoded. The server compresses unconditionally, so decompression has to happen on the device.

**Do the memory math.** About 10.5 KB free after the handshake; 5.6 KB of JSON after inflating; 1.3 KB for the ArduinoJson document; plus an output buffer. Both buffers cannot coexist while BearSSL still holds its own.

**The unlock: MFLN.** The TLS `max_fragment_length` extension lets the record size drop from 16 KB to 512 bytes, and the receive buffer with it. Verify before relying on it:

```bash
openssl s_client -connect xxxxxx.re.qweatherapi.com:443 \
                 -servername xxxxxx.re.qweatherapi.com \
                 -tls1_2 -maxfraglen 512
```

The `ServerHello` extension list echoes type 28 (`0x001c`) with the requested value; 512, 1024 and 4096 are all accepted. The buffers shrink accordingly:

```cpp
constexpr int smallRxBuffer = 1024 + 325;
constexpr int largeRxBuffer = 16384 + 325;
constexpr int txBuffer = 512;
secureConnection->setBufferSizes(smallBuffers ? smallRxBuffer : largeRxBuffer,
                                 txBuffer);
```

The handshake log now proves it instead of assuming it: `small buffers, MFLN 1`. If MFLN is not echoed, the code falls back to the large buffers (which need ≥ 26 KB free).

**Never hold both buffers.** The compressed body is only 748 bytes; the inflated JSON is 5.6 KB. Since closing TLS returns ~12 KB, split the work into stages:

1. Read the headers, capture `Content-Length` (an HTTP/1.0 request always gets one).
2. Read the compressed body into a 4 KB buffer.
3. Close and free the TLS client — heap back to ~19 KB.
4. Inflate into a separate buffer, parse, free.

Order matters: **disconnect first, inflate second.** The other way round, the two buffers collide.

## Fix

Use the uzlib that ships with the ESP8266 SDK (only the inflate half: `tinflate.c`, `tinfgzip.c`, `crc32.c`, `adler32.c`). Its default mode wants a 32 KB ring window; here the whole output is a few kilobytes, so run it in whole-buffer mode:

```cpp
uzlib_uncompress_init(&d, nullptr, 0);   // no dictionary, one output buffer
```

Back-references are bounds-checked by uzlib itself, so no window bookkeeping is needed. The wrapper returns three distinct error codes so the log can name the failure: `-1` invalid stream, `-2` output does not fit, `-3` truncated.

## Verification

"Compiles" proves nothing on an MCU, so the inflater was compiled for the PC and compared byte by byte (`cl -EHsc`, with `INCLUDE`/`LIB` set by hand — no vcvars needed):

| Case | Result |
|---|---|
| Real QWeather error body, 160 B → 184 B | identical |
| Simulated 24 h response, 444 B → 5590 B | identical |
| Buffer deliberately too small (2000 B) | -2 |
| Last 20 bytes truncated | -1 / -3 |
| Input is not gzip | -1 |

On the device:

```
Weather: 748 bytes gzip -> 5654 bytes JSON in 4 ms (heap 12496, block 4504)
Weather updated: 10 degC, condition group 801 (slot 0)
```

## Takeaways

- **Verify "the server will cooperate" before designing around it.** Three rounds were wasted on `identity`, `gzip=n` and port 80. The 403-also-compressed counterexample settled it.
- **Saving memory depends on protocol support.** MFLN turning 16 KB into 1 KB was the single biggest win — and because it only works when the server echoes it, the log line `MFLN 1` is part of the design, not decoration.
- **Never keep two large buffers alive in the same heap.** Read → disconnect → inflate → parse lowers the peak from 12+6 KB to max(12, 6) KB.
- **A PC unit test is the cheapest verification there is.** Five cases took ten minutes, and the byte-exact `cmp` catches the nastiest class of bug: "it inflates, but the data is wrong".

*Next: features are complete and the device stops booting, leaving one line on serial: wdt reset.*

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">从一块灯板到一台中文字钟</p>
  <p class="bi-series-nav">字钟开发调试手记 · 第 4 篇 / 共 7 篇 · <a href="/wordclock-series/">系列目录</a> · <a href="/posts/wordclock-02-half-connected-network/">← 上一篇</a> · <a href="/posts/wordclock-04-boot-loop-heap/">下一篇 →</a></p>
</div>

**接上篇**：上一篇把问题归到了链路上，最后的决定是换数据源——从 HTTP 换成 HTTPS。握手成功的那行日志让人松了半口气，紧接着撞上的是这块板子的物理上限：TLS 一开，30 KB 的堆就不够用了。

> 一个 ESP8266 字钟要给和风天气发 HTTPS 请求。默认 BearSSL 缓冲一开就是 16 KB，握手后堆只剩 8 KB，而解压后的 JSON 要 6 KB，还强制 gzip。这篇讲三个关键动作：把 TLS 记录压到 512 字节（MFLN）、先断连再解压、以及为什么“能省 16 KB”这件事必须先验证。

## 现象

换成和风天气之后，认证、路径、TLS 全部正常，卡在最后一步：

```
TLS connected to xxxxxx.re.qweatherapi.com in 544 ms (heap 10544, small buffers, MFLN 1)
QWeather sent a gzip compressed body, cannot parse it
```

TLS 握手成功，堆还剩 10 KB。但响应体是 gzip，ArduinoJson 拿到的是二进制流，解析必然失败。

## 排查

**① 先试“让服务器别压缩”。** 这是最省事的方案，试了三条路，全都不行：

| 尝试 | 结果 |
|---|---|
| 请求头 `Accept-Encoding: identity` | 被忽略，仍然 `Content-Encoding: gzip` |
| URL 加 `&gzip=n`（网上流传的老办法） | 被忽略 |
| 走 80 端口明文 HTTP | 端口不通，只能 443 |

最能说明问题的一条：**连 150 字节的 403 错误响应都被 gzip 了**。

```bash
curl -s -D - -o /dev/null "https://devapi.qweather.com/v7/weather/24h?location=...&key=0000..."
# content-encoding: gzip
```

服务端是“无条件压缩”，不是“客户端协商压缩”。官方公告也写了 2022 年起 gzip 强制。所以只能在设备上解压。

**② 算一下内存账。** 这才是真正的难点：

```
握手后可用堆         ~10.5 KB
24h 响应压解后       ~5.6 KB JSON
ArduinoJson 文档     ~1.3 KB
解压还需要输出缓冲    ≥5.6 KB
```

10.5 KB 里同时放“解压输出 + JSON 文档”，理论上是紧的，实际一定失败——因为 `WiFiClientSecure` 还占着 12 KB 多的 BearSSL 缓冲没放。

**③ 关键发现：和风支持 MFLN。** TLS 的 `max_fragment_length` 扩展允许把记录长度从默认 16 KB 降到 512 字节，接收缓冲也就能等比缩小。先验证服务端认不认：

```bash
openssl s_client -connect xxxxxx.re.qweatherapi.com:443 \
                 -servername xxxxxx.re.qweatherapi.com \
                 -tls1_2 -maxfraglen 512
```

抓 `ServerHello` 的扩展列表，能看到 type 28（`0x001c`）被回显，值与请求一致。512 / 1024 / 4096 都试过，都会被接受。

于是缓冲从 `16384+325` 直接降到 `1024+325`：

```cpp
constexpr int smallRxBuffer = 1024 + 325;
constexpr int largeRxBuffer = 16384 + 325;
constexpr int txBuffer = 512;

secureConnection->setBufferSizes(smallBuffers ? smallRxBuffer : largeRxBuffer,
                                 txBuffer);
```

TLS 版本新增的这段日志，就是为了让这件事可观测：

```
TLS connected to ... in 544 ms (heap 10544, small buffers, MFLN 1)
```

`small buffers` + `MFLN 1` 同时出现，才说明省内存成功；只有 `small` 而没有 `MFLN`，说明服务器没回显，缓冲可能不够用，代码会回退到大缓冲（要求堆 ≥ 26 KB）。

**④ 剩下的是“两份数据不能同时在堆里”。** 压缩体只有约 0.75 KB（实测 748 字节），解压后 5.6 KB。既然 TLS 一断开就能还回 12 KB，那就分批做：

```
1. 读响应头，抓 Content-Length（HTTP/1.0 请求，服务器一定给这个头）
2. 把压缩体读进一块 4 KB 缓冲（用不了多少堆）
3. 关闭并释放 TLS client  →  堆回到约 19 KB
4. 解压到独立缓冲，解析 JSON，释放
```

顺序很重要：**先断连、再解压**。反过来做，两边的缓冲会正面撞车。

## 解决

解压用 ESP8266 SDK 自带的 **uzlib**（只拷入解压部分：`tinflate.c` / `tinfgzip.c` / `crc32.c` / `adler32.c`），比引入完整 zlib 省得多。

默认的 uzlib 是“环形窗口 + 流式输出”，需要 32 KB 字典。这里用不着——gzip 的整个输出只有几 KB，直接**整块输出**：

```cpp
// 非环形模式：不给字典，整个输出写到 destination
uzlib_uncompress_init(&d, nullptr, 0);
```

回引用（back-reference）的越界由 uzlib 自己检查，所以不需要额外维护窗口。接口做成三个明确错误码，便于日志定位：

```cpp
/* 返回写入字节数，或
 *   -1 不是合法的 gzip/deflate 流
 *   -2 输出放不下（capacity 不够）
 *   -3 流被截断 */
int inflate(const uint8_t *source, size_t sourceLength,
            uint8_t *destination, size_t capacity);
```

## 验证

嵌入式上“编译通过”毫无意义，所以把解压代码单独编译到 PC 上做字节级对比。没有 vcvars 也能做——手动设 `INCLUDE` / `LIB` 即可：

```bash
cl -EHsc -I include -I lib/uzlib/src \
   test.cpp src/WeatherGzip.cpp lib/uzlib/src/{tinflate,tinfgzip,crc32,adler32}.c
```

| 用例 | 结果 |
|---|---|
| 真实和风错误响应 160 B → 184 B | 逐字节一致 |
| 模拟 24h 响应 444 B → 5590 B JSON | 逐字节一致 |
| 缓冲故意给小（2000 B） | 返回 -2 |
| 截掉尾部 20 字节 | 返回 -1/-3 |
| 输入不是 gzip | 返回 -1 |

上机后：

```
Weather: 748 bytes gzip -> 5654 bytes JSON in 4 ms (heap 12496, block 4504)
Weather updated: 10 degC, condition group 801 (slot 0)
```

## 复盘

- **“服务端会配合”的假设必须先验证。** 我在这上面浪费了三轮：`identity` 不行、`gzip=n` 不行、80 端口不通。最后靠“错误响应也被压缩”这个反例确认了“无条件压缩”，才不再试协商。
- **省内存的前提是协议支持。** MFLN 把 16 KB 变 1 KB，是这次改造里收益最大的一步；但它是“服务端回显才生效”的扩展，所以必须打日志确认 `MFLN 1`，不能假设。
- **同一块堆里不要同时放两份大缓冲。** “读完 → 断连 → 解压 → 解析”这个顺序，把峰值从 12+6 KB 压到 max(12, 6) KB。
- **PC 上做单元测试是最便宜的验证。** 解压这种纯函数，在 PC 上跑 5 个用例只要十分钟，比烧录、接串口、看日志快一个数量级；字节级 `cmp` 还能抓到“解压能跑但数据错了”这种最难查的问题。

*下一篇：功能齐了，设备却在开机阶段翻车，串口只剩一行 wdt reset。*

</div>
