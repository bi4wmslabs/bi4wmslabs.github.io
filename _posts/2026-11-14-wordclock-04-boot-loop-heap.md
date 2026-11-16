---
title: 'wdt reset on Boot: From Static Init to Heap Fragmentation'
title_zh: "04｜开机就 wdt reset：从静态初始化到堆碎片"
excerpt: 'The board would not boot. Then 19 KB free and malloc still failed. Two ends of the same weak spot.'
excerpt_zh: "烧进去就起不来，只有一行 wdt reset；修好后又冒出「空闲 19 KB 却分配失败」。同一处薄弱点的两端。"
date: 2026-11-14 20:00:00 +0800
categories: [wordclock, firmware]
tags: [word-clock, esp8266, watchdog, heap]
permalink: /posts/wordclock-04-boot-loop-heap/
series: "从一块灯板到一台中文字钟"
series_en: "From an LED Board to a Chinese Word Clock"
series_no: 5
series_total: 7
---

<span data-zh-title="04｜开机就 wdt reset：从静态初始化到堆碎片" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">From an LED Board to a Chinese Word Clock</p>
  <p class="bi-series-nav">Word Clock Build Notes · Part 5 of 7 · <a href="/wordclock-series/">Series index</a> · <a href="/posts/wordclock-03-tls-gzip-30kb-heap/">← Prev</a> · <a href="/posts/wordclock-05-one-degree/">Next →</a></p>
</div>

*Previously: HTTPS and gzip both worked inside 30 KB, and weather data finally arrived. As features accumulated the firmware began failing at boot — a single `wdt reset` on serial, no Wi-Fi. This time it was not the network but memory.*

## The symptom

After an OTA update to the new 733 KB firmware the device entered a reboot loop:

```
ets Jan  8 2013,rst cause:4, boot mode:(3,6)
wdt reset
```

`rst cause:4` is a software watchdog reset. Apart from those ROM lines, the serial output was empty — and that is easy to misread: **the boot ROM talks at 74880 baud, the application at 115200.** "Nothing printed" really meant "the application never got a chance to speak".

## Investigation

1. **Did it die before `setup()` or inside it?** Two log lines, first and last statement of `setup()`. Only the first appeared, so the crash was inside `setup()` — narrow it to "something expensive during startup".
2. **List the suspects.** This build added exactly three things: a **global** `WiFiClientSecure`, one weather request, and two new EEPROM fields.
3. **Rule them out one by one.**
   - A global `WiFiClientSecure` allocates the SSL context and BearSSL's stack thunk in its constructor — before `main()`, i.e. before `setup()`. If that allocation fails there, you crash before you can log anything.
   - `connect(host, port)` resolves DNS internally with **no timeout parameter**. If the host in EEPROM is erased flash (`0xFF`, never written by the old firmware), the name is garbage and resolution can block past the 3.2 s watchdog window. A blocked loop task means a watchdog reset.
   - Confirmed: both new fields were pure `0xFF`.

## Root cause

Three independent faults, each sufficient on its own:

1. TLS object allocating memory during static initialisation, when the heap is tightest.
2. DNS without a timeout, letting a garbage hostname block until the watchdog fires.
3. New configuration fields used without validation.

## Fix

1. **Create the TLS client on demand, free it after use** — no global object, no buffers held between requests.
2. **Resolve DNS ourselves, with an explicit bound**:
   ```cpp
   if (WiFi.hostByName(requestHost, address, 3000) != 1) { ... }
   secureConnection->connect(address, qweatherPort);
   ```
   3 s is deliberately below the 3.2 s watchdog: **any potentially blocking call must time out faster than the watchdog**, otherwise the watchdog fires first and takes the evidence with it.
3. **Validate the configuration at boot** (`hostIsPlausible`, `locationIsPlausible`), clear it when implausible, and let `qweatherConfigured()` return false. Not requesting at all beats requesting and crashing.
4. **Startup grace plus self-protection**: no weather request during the first 20 s, so LEDs and the web server come up first and the OTA page stays reachable — as long as the web UI opens, the device is not bricked. On top of that, if this boot followed a watchdog or exception reset, weather is skipped for the whole boot. The clock always starts; bad weather only costs two dark rows.

## The second trap: 19 KB free, malloc still fails

```
TLS connected ... (heap 8416, small buffers, MFLN 1)
Weather: cannot allocate 12288 bytes for the inflated response
```

The heap figure in that line is a snapshot taken *during* the handshake. After the session closed there were ~19 KB free — but the largest contiguous block was ~12.2 KB, and the request was for 12288 bytes. Classic fragmentation: creating the client frees 6.4 KB, the handshake another 6.0 KB, and the two freed regions do not necessarily merge.

`ESP.getFreeHeap()` is the misleading number here; `ESP.getMaxFreeBlockSize()` is the useful one. Three changes followed: cap the buffer at the real payload size (5.6 KB, not 12 KB), try a candidate ladder `{8192, 6144, 5120}` instead of one all-or-nothing allocation, and free the compressed body before building the JSON document. Only the `malloc` return value is trustworthy.

## Takeaways

- **A watchdog reset can leave no log at all.** Check the baud rate first, then use "first line vs last line of `setup()`" to locate the crash.
- **Blocking calls must time out faster than the watchdog**, or every failure looks like an unexplained reboot.
- **Do not touch large allocations during static initialisation.** A global `WiFiClientSecure` on ESP8266 is a trap.
- **Degradation paths beat "just barely fits".** Grace period, watchdog self-protection, skip-this-boot: the worst case becomes two dark rows instead of a reboot loop.
- **Never use total free heap to decide whether an allocation will succeed.** Total, largest block, fragmentation: three different facts. Log both `heap` and `block`.

*Next: stable at last, but temperature only moves in 5 °C steps — one degree needs one more row.*

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">从一块灯板到一台中文字钟</p>
  <p class="bi-series-nav">字钟开发调试手记 · 第 5 篇 / 共 7 篇 · <a href="/wordclock-series/">系列目录</a> · <a href="/posts/wordclock-03-tls-gzip-30kb-heap/">← 上一篇</a> · <a href="/posts/wordclock-05-one-degree/">下一篇 →</a></p>
</div>

**接上篇**：上一篇结束时，HTTPS 与 gzip 都在 30 KB 的堆里跑通了，天气终于能拿到。可功能一多，固件开始在开机阶段翻车：串口只剩一行 `wdt reset`，连 WiFi 都连不上——这次不是网络问题，是内存问题。

> 固件烧进去，设备起不来了，串口只有一行 `wdt reset`。修好之后又冒出 `cannot allocate 12288 bytes`——总空闲 19 KB 却说没内存。这两个问题看起来无关，其实是同一条线上的两端：**ESP8266 的堆在启动阶段最脆弱**。

## 现象

OTA 升级到 733 KB 的新固件后，设备进入重启循环：

```
ets Jan  8 2013,rst cause:4, boot mode:(3,6)
wdt reset
```

`rst cause:4` 是软件看门狗复位。串口里除了 boot ROM 这几行，应用日志一个字都没有——这里有个容易误判的点：**boot ROM 用 74880 波特率，应用日志用 115200**。看起来“什么都没打印”，其实是没有等到应用层说话。

## 排查

**① 先确认“死在 setup 之前”还是“setup 里”。** 在 `setup()` 的第一行和最后一行各加一条日志：

```cpp
Serial.printf("[boot] reset reason: %s, heap %u\n",
              ESP.getResetReason().c_str(), ESP.getFreeHeap());
...
Serial.printf("[boot] setup done, heap %u, weather %d\n", ...);
```

结果只有前者、没有后者——死在 `setup()` 中间。范围立刻缩小到“启动阶段做了什么耗资源的事”。

**② 列出 setup 阶段的嫌疑犯。** 这一版新增的东西只有三类：

- 一个**全局** `WiFiClientSecure` 对象
- 一次天气请求
- EEPROM 里新加的两个字段

前两个都值得怀疑，第三个更像是“读出来是垃圾值”。

**③ 逐个排除。**

- **全局对象**：`WiFiClientSecure` 在构造时就要分配 SSL context 和 BearSSL 的 stack thunk（几 KB）。C++ 全局对象在 `main()` 之前、也就是 `setup()` 之前构造——那时堆还没有被任何东西整理过，失败就是直接崩，而且崩在 `setup()` 之前，连日志都来不及打。
- **DNS**：`WiFiClientSecure::connect(host, port)` 内部做 DNS，**没有超时参数**。如果 EEPROM 里的 host 是擦除态的 `0xFF`（旧固件没写过这些字节），拼出来就是一个垃圾域名，解析会一路卡到网络栈放弃——这个时间足以超过看门狗 3.2 秒的窗口。而 loop 任务被卡住，看门狗就会复位。
- **EEPROM 垃圾值**：确认了。旧固件从没写过这两个字段，`0xFF` 一片，`host` 不是合法域名、`location` 不是 9 位数字。

## 根因

三条叠加，任何一条都能让设备起不来：

1. **TLS 对象在静态初始化阶段就分配内存**，启动早期堆最紧张。
2. **DNS 没有超时**，垃圾域名把 loop 任务卡到看门狗复位。
3. **新字段没有清洗**，`0xFF` 被当成有效配置使用。

## 解决

对应上面三条，四两拨千斤：

**① TLS 客户端改成“用时才建、用完就删”。**

```cpp
// 不再有全局 WiFiClientSecure
secureConnection = new WiFiClientSecure();   // 首次请求时才分配
...
releaseClient();                             // 用完立刻释放，堆还回去
```

顺带解决了文章 03 里的内存问题：TLS 缓冲不再常驻。

**② DNS 自己做，并且给出明确上限。**

```cpp
IPAddress address;
if (WiFi.hostByName(requestHost, address, 3000) != 1) {   // 3 s 上限
    Serial.printf("Weather: DNS %s failed\n", requestHost);
    return false;
}
secureConnection->connect(address, qweatherPort);          // 直连 IP
```

3 秒 < 看门狗 3.2 秒，是刻意选的：**任何可能阻塞的操作，超时必须短于看门狗周期**，否则看门狗会先动手，你连错误日志都拿不到。

**③ 开机先清洗配置，再判断“能不能用”。**

```cpp
inline bool hostIsPlausible(const char *host);      // xxx.re.qweatherapi.com
inline bool locationIsPlausible(const char *location);  // 9 位数字 + 结束符
```

`ensureWeatherData()` 里对两个字段做校验，不合法就清空。清空之后 `qweatherConfigured()` 返回 false，请求根本不会发——**用“不请求”代替“请求然后崩”**。

**④ 启动宽限期 + 看门狗自保。**

```cpp
constexpr uint32_t startupGraceMs = 20000;   // 开机 20 s 内不取天气
```

保证 LED 和网页服务先起来，OTA 页面可达——**只要网页能打开，设备就没变砖**，这一条比修复本身更重要。

再加一层兜底：如果这次启动的原因是看门狗或异常，就跳过本次的天气请求。

```cpp
if (ESP.getResetReason().indexOf("Watchdog") >= 0 ||
    ESP.getResetReason().indexOf("Exception") >= 0) {
    weather.skipUntilNextBoot();
}
```

效果是：**哪怕天气这条链路再次出问题，字钟本身一定能起来**，坏天气只会让两行不亮，而不会让整台设备变砖。

## 第二个坑：19 KB 空闲，却 malloc 失败

启动问题修好后，日志变成：

```
TLS connected ... (heap 8416, small buffers, MFLN 1)
Weather: cannot allocate 12288 bytes for the inflated response
```

`TLS connected` 后面那段括号是**握手过程中**的快照，别拿它当“关闭后的堆”。真正的状态是：TLS 关闭后总空闲约 19 KB，而最大连续块只有约 **12.2 KB**——申请 12288 字节，差一点点，失败。

这是典型的**堆碎片**：`WiFiClientSecure` 创建时掉 6.4 KB，握手时再掉 6.0 KB，两块释放后并不一定合并成 18 KB，而是留下两个洞。

`ESP.getFreeHeap()` 在这里是**误导性指标**。真正该看的是最大可分配块：

```cpp
const uint32_t freeHeap = ESP.getFreeHeap();
const uint32_t maxBlock = ESP.getMaxFreeBlockSize();
```

对应的修法三条：

**① 缓冲上限按真实数据定，不按“留余量”定。** 24h 响应解压后 5.6 KB，12 KB 的上限毫无必要。

**② 候选表降级，而不是一次定生死。**

```cpp
static const size_t candidates[] = {8192, 6144, 5120};
for (const size_t candidate : candidates) {
    json = static_cast<uint8_t *>(malloc(candidate));
    if (json != nullptr) { capacity = candidate; break; }
}
```

紧凑的响应在 5 KB 缓冲里也能解析完；失败一次只损失几十微秒。**只有 malloc 返回值是可靠判据，堆的统计数字不是。**

**③ 解压完先释放压缩体，再建 JSON 文档。**

```cpp
processWeatherResponse(json, length);
free(json);      // 先归还大缓冲
```

修完后的日志：

```
Weather: 748 bytes gzip -> 5654 bytes JSON in 4 ms (heap 12496, block 4504)
```

## 复盘

- **看门狗复位时，日志可能“什么都没留下”。** 先确认波特率（boot ROM 74880 / 应用 115200），再用“setup 第一行 vs 最后一行”两条日志判断死在哪，比看复位原因更有用。
- **任何可能阻塞的调用，超时要短于看门狗。** 否则你看到的现象永远是“莫名复位”，而不是“DNS 失败”。
- **静态初始化阶段不要碰大内存。** ESP8266 上全局 `WiFiClientSecure` 是个陷阱：它在 `setup()` 之前就要几 KB，而那时你没有任何补救手段。
- **降级路径比“刚好够用”更可靠。** 20 秒宽限、看门狗自保、跳过本次请求，这些“退让”让设备最坏情况下只是少显示天气，而不是反复重启。
- **不要用 `getFreeHeap()` 判断能不能 malloc。** 堆的总量、最大连续块、碎片率是三件事。日志里同时打印 `heap` 和 `block`，一眼就能分清是“真的没内存”还是“内存被切碎了”。

*下一篇：设备稳定了，温度却只有 5℃ 台阶——为了 1℃，得回硬件再要一行字。*

</div>
