---
title: 'Two Dead Rows: an Investigation That Started at “the Display Looks Fine”'
title_zh: "01｜天气两行全灭：一次「显示没问题」的排查"
excerpt: 'Time and weekday were perfect, weather and temperature were black. One invariant moved the fault from the display to the data layer.'
excerpt_zh: "时间、星期都对，天气和温度两行全黑。一条判据把故障从显示层搬到数据层，外带两个白跑半天的陷阱。"
date: 2026-11-11 20:00:00 +0800
categories: [wordclock, firmware]
tags: [word-clock, esp8266, debugging, ota]
permalink: /posts/wordclock-01-weather-rows-dark/
series: "从一块灯板到一台中文字钟"
series_en: "From an LED Board to a Chinese Word Clock"
series_no: 2
series_total: 7
---

<span data-zh-title="01｜天气两行全灭：一次「显示没问题」的排查" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">From an LED Board to a Chinese Word Clock</p>
  <p class="bi-series-nav">Word Clock Build Notes · Part 2 of 7 · <a href="/wordclock-series/">Series index</a> · <a href="/posts/wordclock-00-prologue/">← Prev</a> · <a href="/posts/wordclock-02-half-connected-network/">Next →</a></p>
</div>

*Previously: the prologue noted that rows 7–9 were added later and only light up if the firmware really fetches data. On first power-up the time and weekday were correct and those three rows stayed dark. The first failure of the series starts here.*

## The symptom

A multilingual ESP8266 word clock (Multilayout-ESP-Wordclock 5.0.0) running the Chinese `ZH10x11` layout — 10 rows by 11 columns. Rows 1–6 showed time and weekday correctly. Rows 7 (condition) and 8 (temperature) were completely dark.

The first instinct is hardware: dead LEDs? But the panel is one continuous WS2812 chain — a break in the middle would kill everything after it, and row 9 (a decorative couplet) is never lit by design, which made "a local fault" look plausible.

## Investigation

**Step 1: prove the display path is fine.** The chain is short:

```
setChineseClock()
  └─ weather.currentWeather(cond, temp)   // bails out when it returns false
       └─ showChineseWeather(cond, temp)
            └─ usedClockType->show(FrontWord::zh_*)
```

`currentWeather()` starts with `if (!forecastValid) return false;`. With valid data, even 0 °C lights the two characters for "zero degrees". Two rows dark at once, without a single flash, cannot be a rounding edge case — it means `forecastValid == false`, i.e. not one successful request had ever happened. Five minutes of reading moved the problem from "hardware/rendering" to "network/configuration".

**Step 2: get the serial log.** That is where the first trap was.

At 115200 8N1 the output was pure garbage. Not a baud rate problem — a wiring problem. The LED data pin in this build is `LED_PIN 3`, i.e. GPIO3. On the ESP8266, GPIO3 is also UART0 RX, and NeoPixelBus drives the strip through I2S/DMA, which holds GPIO3 permanently. Feeding that pin into a USB-TTL receiver samples a DMA-driven line: guaranteed noise.

The fix is to connect only **GPIO1 (TX)** to the adapter's RX, with a common ground. The garbage in the first few lines at power-up is the boot ROM talking at 74880 baud — normal, ignore it.

**Step 3: read the log.** With clean output the failure became concrete:

```
Calling URL: /data/2.5/forecast?id=1799962&appid=****
Connection to Openweathermap.org failed
```

It failed before the JSON stage. Which raised the question: are the city ID and API key actually in EEPROM?

**Step 4: check whether the configuration survives flashing.** Second trap, and the one that wastes the most time. The project's upload script adds `--erase-all` to `esptool`, wiping the entire flash. `Config.h` ships with `OWM_CITY_ID` / `OWM_API_KEY` commented out, so the credentials live *only* in EEPROM. Every serial upload therefore erased Wi-Fi and weather settings — producing symptoms indistinguishable from a firmware bug.

Control experiment: same firmware, uploaded over the air (`http://<IP>:81/update`, `firmware.bin` only). Configuration intact, request went out immediately. Case closed.

## Root cause

Not a display bug. Empty configuration, plus two mental traps:

| What you see | What it actually is |
|---|---|
| Garbled serial output | GPIO3 used as UART RX while it is the LED I2S data pin |
| No weather | `--erase-all` wipes EEPROM; key and city ID are gone |

## Fix

The code change is small; the point is to make the next occurrence self-explaining.

1. **Fetch immediately after saving** instead of waiting up to 10 minutes:
   ```cpp
   if (submittedApiKey[0] != '\0') {
       weather.requestNow();
   }
   ```
2. **Retry after 60 s on failure**, and always print one line on success:
   `Weather updated: 10 degC, condition group 801 (slot 0)` — that single line separates "no data" from "wrong data".
3. **Print a one-time hint** when no key is configured, instead of failing silently.

Then make OTA the only upgrade path for daily use; keep serial flashing for recovery, and accept that it resets Wi-Fi and weather settings.

## Takeaways

- **One invariant beats a round of trial and error.** Two dark rows at once can only come from the data layer. Ask "which failure makes both rows go dark?" while writing the code, not after.
- **Serial is the only ground truth on an embedded target** — provided the wire is on the right pin. Pin multiplexing with a DMA-driven LED strip is not in any datasheet you will actually read.
- **"It flashed" and "the config is still there" are different facts.** `--erase-all` is convenient during development and catastrophic during delivery.
- Log lines earn their keep when each one answers a yes/no question: is `Weather updated` there? What is `heap`? Which `slot`?

*Next: the log says connected, yet not a single byte comes back — how a successful handshake lies.*

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">从一块灯板到一台中文字钟</p>
  <p class="bi-series-nav">字钟开发调试手记 · 第 2 篇 / 共 7 篇 · <a href="/wordclock-series/">系列目录</a> · <a href="/posts/wordclock-00-prologue/">← 上一篇</a> · <a href="/posts/wordclock-02-half-connected-network/">下一篇 →</a></p>
</div>

**接上篇**：序章里说，面板最后几行是后加的信息行，亮不亮取决于固件能不能真的从网上取回数据。第一次通电，时间、星期、分钟全对，天气和温度这两行一个灯都没亮。系列的第一个故障就从这里开始。

> 字钟的时间、星期都对，只有天气和温度两行一个灯都不亮。我从“是不是灯板坏了”一路查到“这台设备从来没有成功请求过一次天气”。这篇讲的是**如何用一条日志把问题锁死在数据层**，以及两个让排查白跑半天的环境陷阱。

## 现象

一台基于 ESP8266 的多语言字钟（Multilayout-ESP-Wordclock 5.0.0），中文布局 `ZH10x11`，10 行 × 11 列。第 1–6 行显示时间与星期，一切正常；第 7 行（天气状况）和第 8 行（温度）**全灭**。

第一反应是硬件：是不是这两行的灯珠虚焊了？但灯板是整条 WS2812 串起来的，中间断一段后面全黑，而第 9 行（装饰对联）本来就不该亮——这反而让“局部坏”看起来很像真的。

## 排查

**第一步：先证明显示链路是通的。**

代码路径很清晰：

```
setChineseClock()
  └─ weather.currentWeather(cond, temp)   // 返回 false 就整段跳过
       └─ showChineseWeather(cond, temp)
            └─ usedClockType->show(FrontWord::zh_*)
```

`currentWeather()` 里只有一句 `if (!forecastValid) return false;`。也就是说：**只要数据有效，0 ℃ 也会亮“零度”两个字**。两行同时全灭、且没有任何一个词闪一下，那就不可能是“温度恰好取整到某个没字的档位”——只可能是 `forecastValid == false`，即一次成功的请求都没有。

这一步花五分钟，直接排除了灯板、排除了绘制逻辑，把问题从“硬件/显示”搬到“网络/配置”。

**第二步：拿到串口日志。** 于是踩了第一个坑。

115200 8N1 接上去全是乱码：

```
~ld ��|�l��l`��...
```

原因不是波特率，而是**接线位置**。这个固件的 LED 数据脚是 `LED_PIN 3`，也就是 GPIO3。ESP8266 上 GPIO3 同时是 UART0 的 RX，而 NeoPixelBus 在 ESP8266 上靠 I2S/DMA 驱动灯带，会**长期占用 GPIO3**。把 USB-TTL 的 RX 接到 GPIO3，等于把一个正在被 DMA 高速翻转的引脚当串口读——必然是垃圾。

正确做法：只接 **GPIO1（TX）** 到 USB-TTL 的 RX，GND 共地。另外开机头几行的乱码是 boot ROM 以 74880 波特率输出的，属于正常现象，不用管。

**第三步：读日志。** 拿到干净输出后，问题一下就具体了：

```
Calling URL: /data/2.5/forecast?id=1799962&appid=****
Connection to Openweathermap.org failed
```

请求在**解析/连接阶段**就失败了，根本没走到 JSON 解析。这时候怀疑配置：城市 ID 和 API Key 都存在 EEPROM 里，会不会是空的？

**第四步：确认配置是不是被擦了。** 这是第二个坑，也是最容易反复踩的。

项目里的串口上传脚本 `extra_scripts/erase_before_upload.py` 会给 `esptool` 加 `--erase-all`，也就是**全片擦除**。而 `Config.h` 里的 `OWM_CITY_ID` / `OWM_API_KEY` 默认是注释掉的——配置只存在 EEPROM。结果就是：**每串口烧录一次，WiFi 和天气配置全清空**，然后你看到的现象和“代码有 bug”一模一样。

对照实验：同一份固件用 OTA（`http://<IP>:81/update`，只上传 `firmware.bin`）刷入，配置保留，请求立刻就能发出去。至此证据链闭合。

## 根因

不是显示 bug，是**配置层为空**，叠加**两处认知陷阱**：

| 现象 | 真实原因 |
|---|---|
| 串口乱码 | 把 GPIO3 当 UART RX，而它是灯带的 I2S 数据脚 |
| 天气不显示 | 串口烧录 `--erase-all` 清空 EEPROM，Key/CityID 丢失 |

## 解决

真正的代码改动其实很小，重点是让“下次不用猜”：

**① 保存配置后立刻重取**，而不是等下一个 10 分钟周期：

```cpp
// COMMAND_SET_WEATHER_DATA 处理完
if (submittedApiKey[0] != '\0') {
    weather.requestNow();
}
```

**② 失败不再等 10 分钟**，改成 60 秒重试；成功则无条件打印一行结果：

```
Weather updated: 10 degC, condition group 801 (slot 0)
```

有了这行，“没数据”和“数据不对”就能一眼区分。

**③ 串口提示一次“Key 未配置”**，而不是静默失败。

另外把烧录习惯固定下来：**日常更新一律走 OTA**，只有救砖才用串口，并接受“刷完要重新配网 + 重新填天气”。

| 方式 | 地址 | EEPROM |
|---|---|---|
| OTA | `http://<IP>:81/update`，字段名 `firmware` | 保留 |
| 串口 | `pio run -t upload`（带 `--erase-all`） | **清空** |

## 复盘

- **一条判据省掉一轮试错**：两行同时全灭 ⇒ 不是显示层。写代码时就该问“哪种失败会让这两行同时不亮”，答案只有一种。
- **串口是嵌入式唯一的事实来源**，但前提是接对脚。灯带占用 UART 引脚这种事，datasheet 不写、原理图也不一定标，只能靠“接了没反应就先怀疑引脚复用”的经验。
- **“能烧进去”和“配置还在”是两件事**。带 `--erase-all` 的脚本在开发期很方便（保证干净），在交付期就是灾难。默认把 OTA 作为唯一升级路径，串口只用于首次烧录。
- 日志的价值不在“打印得多”，而在**每一行都能回答一个是非题**：`Weather updated` 在不在？`heap` 是多少？`slot` 是几？

*下一篇：日志说连上了，可一个字节都等不回来——握手的成功是怎么骗人的。*

</div>
