---
title: 'TCP Connects, but No Response Ever Arrives'
title_zh: "02｜TCP 连得上，却永远等不到响应：一次「半连通」网络的排查"
excerpt: 'A 248 ms handshake followed by ten seconds of silence. How to split “network down” into layers you can actually test.'
excerpt_zh: "握手 248 毫秒成功，然后十秒静默。把「网络不通」拆成几层可验证的假设，以及为什么最后换了数据源。"
date: 2026-11-12 20:00:00 +0800
categories: [wordclock, firmware]
tags: [word-clock, networking, tcp, debugging]
permalink: /posts/wordclock-02-half-connected-network/
series: "从一块灯板到一台中文字钟"
series_en: "From an LED Board to a Chinese Word Clock"
series_no: 3
series_total: 7
---

<span data-zh-title="02｜TCP 连得上，却永远等不到响应：一次「半连通」网络的排查" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">From an LED Board to a Chinese Word Clock</p>
  <p class="bi-series-nav">Word Clock Build Notes · Part 3 of 7 · <a href="/wordclock-series/">Series index</a> · <a href="/posts/wordclock-01-weather-rows-dark/">← Prev</a> · <a href="/posts/wordclock-03-tls-gzip-30kb-heap/">Next →</a></p>
</div>

*Previously: the conclusion was blunt — the device had never completed a single weather request. With the configuration restored and the key verified, the request did go out and the log showed `Connected in 248 ms`; then nothing. This article starts right after that 248 ms.*

## The symptom

With the configuration fixed, the request finally went out — and stopped here:

```
Weather: DNS api.openweathermap.org -> 15.235.227.40
Connected to api.openweathermap.org in 248 ms
Timeout while waiting for weather response
```

The contradiction is glaring: the TCP handshake completed in 248 ms, so DNS, routing and the port all work. Yet not a single byte of HTTP came back within a 10-second timeout. The first reflex was "the response is slow" or "the body timeout is too short", so the connect timeout went from 2 s to 8 s and the body timeout from 1 s to 3 s. Nothing changed. That non-result is itself the signal: not slow — absent.

## Investigation

A microcontroller can only run so many experiments, so confirm the facts from a PC on the same network: same target, same protocol, different client. If the PC fails too, the firmware is not the problem.

1. **Separate proxy from direct.** Both paths timed out.
2. **Add a control target.** `baidu.com` answered `200` in 52 ms in the same shell. The network is fine; the problem is the path to `openweathermap.org`.
3. **Bypass DNS.** All three resolved addresses (`15.235.204.135`, `15.235.222.68`, `15.235.227.40`) timed out, so it is not one bad host but the whole `15.235.x.x` range (OVH Singapore) on this cross-border route.
4. **Explain the successful handshake.** On such routes the SYN/SYN-ACK is often answered at the edge while packets carrying data are silently dropped further in. `connect()` returns success, `read()` waits forever. That is a "half-connected" network.

So `Connected in 248 ms` is not good news — it only proves the handshake got an answer, not that the HTTP service is usable. That is also why tuning timeouts did nothing: the wait was not too short, the answer was never coming.

## Root cause

`openweathermap.org` (OVH Singapore) is half-reachable from this network: TCP works, the application layer does not. Nothing in the firmware can fix that — not retries, not longer timeouts, not a different resolver.

## Fix

Switch the data source to QWeather, and keep the change inside the fetch layer.

**Translate the new semantics back into the old ones.** The display code groups conditions by OpenWeatherMap ids (800 clear, 801 clouds, 5xx rain…), while QWeather reports three-digit icon codes. One mapping function keeps everything downstream untouched:

```cpp
inline uint16_t conditionGroupFromIcon(const char *icon) {
    const int id = atoi(icon);
    if (id == 100 || id == 150) return 800;
    if (id >= 101 && id <= 104) return 801;
    if (id >= 302 && id <= 304) return 200;
    if (id >= 300 && id <= 399) return 500;
    if (id >= 400 && id <= 499) return 600;
    if (id >= 500 && id <= 599) return 700;
    return 0;
}
```

**QWeather requires an account-specific API host** (like `xxxxxx.re.qweatherapi.com`); the public `devapi.qweather.com` returns `403 Invalid Host`. The host is only visible in the console under the project.

**EEPROM rule: new fields may only be appended.** The configuration is a raw struct dump, read back by offset. The first attempt inserted the two new fields in the middle of `GLOBAL`; every following field shifted, Wi-Fi credentials and brightness decoded as garbage, and the device refused to boot. Appending at the end kept the old layout valid (`sizeof(G)` went from 440 to 493, still below the power-cycle byte at 511).

That deserves its own line: **if you dump a struct to flash, you have signed a contract — append only, never insert, never change a type.**

## Verification

Build passed at 62.7% RAM / 69.8% flash, `firmware.bin` around 733 KB — plenty of room in the OTA partition. The log showed the full chain (`TLS connected … in 544 ms`), and the clock lit both weather rows again.

## Takeaways

- **A successful `connect()` is not proof a service works.** In half-connected networks the handshake is the most misleading evidence available.
- **Control experiments beat parameter guessing**: other client, other target, other addressing mode — three steps to rule out your own code.
- **Shield the rest of the codebase from a provider change.** One mapping layer meant the layouts, EEPROM and display logic did not move at all.
- **Struct-dump configuration: append only.** If that is not written down, someone — probably future you — will insert a field.

*Next: HTTPS works, the handshake succeeds, and 30 KB of heap is not enough — fitting TLS and gzip together.*

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">从一块灯板到一台中文字钟</p>
  <p class="bi-series-nav">字钟开发调试手记 · 第 3 篇 / 共 7 篇 · <a href="/wordclock-series/">系列目录</a> · <a href="/posts/wordclock-01-weather-rows-dark/">← 上一篇</a> · <a href="/posts/wordclock-03-tls-gzip-30kb-heap/">下一篇 →</a></p>
</div>

**接上篇**：上一篇的结论很干脆——这台设备从来没有成功请求过一次天气。配置补齐、Key 核对无误之后，请求确实发出去了，日志也打印了 `Connected in 248 ms`；然后就没有然后了。这一篇从那个 248 毫秒之后讲起。

> 串口打印 `Connected in 248 ms`，然后是 10 秒超时。看起来是代码超时设短了，实际上是整条链路对某个 IP 段“半连通”——握手能回来，数据回不来。这篇讲怎么把“网络不通”拆成可验证的几层，以及为什么最后选择了换数据源。

## 现象

修好配置之后，请求终于发出去了，但日志停在这里：

```
Weather: DNS api.openweathermap.org -> 15.235.227.40
Connected to api.openweathermap.org in 248 ms
Timeout while waiting for weather response
```

矛盾点很刺眼：**TCP 握手 248 ms 就完成了**，说明 DNS、路由、端口全是通的；但一个字节的 HTTP 响应都收不到，超时是 10 秒，远超正常 RTT。

第一反应是“响应体太慢”或者“body 超时设太短”，于是把连接超时从 2 秒调到 8 秒、body 超时从 1 秒调到 3 秒。**毫无变化**。这本身就是个信号：不是“慢”，是“没有”。

## 排查

嵌入式设备上能做的实验有限，所以先用同一网络下的 PC 把事实确认下来——**同样的目标、同样的协议、不同的客户端**，如果 PC 也不通，那问题就不在固件。

**① 分清代理和直连。** 本机 `curl` 走了系统代理，先两边都测：

```bash
# 直连，忽略环境里的 http_proxy
curl -s --noproxy '*' -o /dev/null -w "%{http_code} %{time_total}\n" \
     --max-time 15 https://api.openweathermap.org/data/2.5/weather?id=1799962
# 走代理
curl -s -o /dev/null -w "%{http_code} %{time_total}\n" --max-time 15 \
     https://api.openweathermap.org/data/2.5/weather?id=1799962
```

两条都是超时。这就排除了“设备 DNS 有问题”“ESP8266 TLS 有问题”这类猜测。

**② 加一个对照目标。** 同一个 shell 里测百度：

```
baidu.com   200   52 ms
```

网络本身是好的。于是问题被收窄成：**从这条线路到 openweathermap.org 这一段**。

**③ 绕开 DNS，直接打 IP。** 日志里解析出的三个地址全部单独测：

```
15.235.204.135  timeout
15.235.222.68   timeout
15.235.227.40   timeout
```

三条全挂，说明不是某台机器的问题，而是整个 `15.235.x.x` 段（OVH 新加坡）在这条跨境链路上不可达。

**④ 解释“为什么 TCP 能握手”。** 这是最有意思的一点。跨境链路上常见的形态是：**SYN/SYN-ACK 在边缘就完成了**（运营商或 CDN 侧代答），而后续携带数据的包在中间被静默丢弃。对客户端来说，`connect()` 返回成功，`read()` 永远等不到东西——这就是“半连通”。

所以 `Connected in 248 ms` 这条日志**不是好消息，是误导**。它只证明“三次握手有回应”，不证明“这个 HTTP 服务可用”。这也解释了为什么调超时参数毫无作用：不是等得不够久，是等的东西不会来。

## 根因

`openweathermap.org`（OVH 新加坡段）在该网络下**半连通**：TCP 可达、应用层不可达。属于网络侧问题，固件无法修复——重试、加超时、换 DNS 都没用。

## 解决

既然链路不通，只能换数据源。选择国内可直连的**和风天气（QWeather）**，并把改动限制在“取数”这一层，显示逻辑一行不动：

**① 只要把数据格式翻译回原来的语义，上层就不用改。** 原代码按 OpenWeatherMap 的 condition id 分组（800 晴 / 801 多云 / 5xx 雨…），和风给的是三位图标码（100 晴 / 104 阴 / 305 小雨…）。于是加一个映射函数，把图标码折回原有的分组：

```cpp
inline uint16_t conditionGroupFromIcon(const char *icon) {
    const int id = atoi(icon);
    if (id == 100 || id == 150) return 800;          // 晴
    if (id >= 101 && id <= 104) return 801;          // 多云 / 阴
    if (id >= 302 && id <= 304) return 200;          // 雷
    if (id >= 300 && id <= 399) return 500;          // 雨
    if (id >= 400 && id <= 499) return 600;          // 雪
    if (id >= 500 && id <= 599) return 700;          // 雾霾
    return 0;
}
```

**② 注意和风 2024 年后的一个变化**：必须使用账号专属的 API Host（形如 `xxxxxx.re.qweatherapi.com`），公共的 `devapi.qweather.com` 会直接返回 `403 Invalid Host`。这个 Host 只能从控制台的「项目」里拿。

**③ EEPROM 的硬约束：新字段只能追加在结构体末尾。**

这是整个改造里唯一“错了就很难查”的地方。配置是 `GLOBAL` 结构体的**原始字节转储**，字段按偏移量读取：

```c
// 追加在末尾，原有字段偏移不变
char qweatherLocation[12];   // 9 位 Location ID + 结束符
char qweatherHost[41];       // <account>.re.qweatherapi.com
```

第一次改造时我把这两个字段插到了结构体**中间**，结果所有后续字段整体偏移，读出来的 WiFi 密码、亮度、布局全是乱的，设备直接启动失败。回滚后改成**末尾追加**，老配置原样可用（`sizeof(G)` 从 440 增到 493，仍小于上电计数字节 511）。

这个坑值得单独记一笔：**任何“结构体直接 dump 到 flash”的设计，等于给自己定了一条不可违反的规则——只许追加，不许插入、不许改类型。**

## 验证

- 编译通过，RAM 62.7% / Flash 69.8%，`firmware.bin` 约 733 KB，OTA 分区余量充足。
- 串口日志出现完整链路：

```
Calling URL: /v7/weather/24h?location=101190101&key=*******12A&lang=zh
TLS connected to xxxxxx.re.qweatherapi.com in 544 ms
```

- 设备显示恢复正常：第 7 行天气、第 8 行温度都亮了。

## 复盘

- **`connect()` 成功不等于服务可用。** 在半连通网络里，握手成功恰恰是最容易骗人的证据。判断网络问题要看**应用层是否拿到了数据**，而不是 socket 是否建立。
- **对照实验比猜参数快。** 同一网络下换客户端（PC vs 设备）、换目标（百度 vs OWM）、换寻址方式（域名 vs IP），三步就能把“我的代码有问题”排除掉。
- **改数据源时，把差异挡在最外层。** 用一层映射把新 API 的语义翻译回旧的分组，下游（显示、布局、EEPROM）完全不用动，回归面积极小。
- **结构体 dump 型配置，只许末尾追加。** 这条规则不进文档，迟早会有人（包括未来的自己）踩。

*下一篇：换到 HTTPS，握手成功了，紧接着 30 KB 的堆不够用——TLS 和 gzip 怎么挤进同一块内存。*

</div>
