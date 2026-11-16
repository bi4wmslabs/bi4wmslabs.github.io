---
title: "Engineering Notes"
title_zh: "工程笔记"
permalink: /notes/
layout: home
---

<section class="bi-section">
  <p class="bi-eyebrow" data-zh="来自工作台">FROM THE WORKBENCH</p>
  <h1 data-zh="工程笔记">Engineering notes</h1>
  <p class="bi-lead" data-zh="设计取舍、器件选型、PCB 布局、点亮调试，以及来自真实项目的经验教训。按系列整理，英文原文与中文全文可用右下角按钮切换。">Design decisions, component research, PCB layout, bring-up, debugging, and lessons from real builds. Organised by series; switch between the full English and Chinese text with the button in the lower-right corner.</p>
</section>

<!-- 笔记索引按系列分组，OCTET 置顶。
     每组的标题与说明用 data-zh 交给全站唯一引擎 v6 处理，不进 DICT。 -->

{% include notes-group.html id="octet" key="OCTET DAQ001 八通道 IEPE 采集器" en="OCTET DAQ001 · 8-Channel IEPE Acquisition Unit" zh="OCTET DAQ001 八通道 IEPE 采集器" desc_en="Seven notes on requirements, architecture, USB enumeration, ADC and storage debugging, protocol, user manual and the formal protocol specification." desc_zh="七篇设计与调试实录：需求、架构、USB 枚举、ADC 与存储调试、协议、使用说明书，以及正式通信协议规范。" index_url="/octet-series/" index_en="Open the series index →" index_zh="打开系列目录 →" %}

{% include notes-group.html id="wordclock" key="从一块灯板到一台中文字钟" en="From an LED Board to a Chinese Word Clock" zh="从一块灯板到一台中文字钟" desc_en="Seven notes on a Chinese word clock built on Multilayout-ESP-Wordclock 5.0.0: three stacked boards, the Chinese firmware port, and every failure from a dark weather row to one degree of temperature precision." desc_zh="七篇改造实录：基于 Multilayout-ESP-Wordclock 5.0.0 的中文字钟——三层硬件、中文固件移植，以及从天气两行不亮到 1℃ 精度的每一次排查。" index_url="/wordclock-series/" index_en="Open the series index →" index_zh="打开系列目录 →" %}

{% include notes-group.html id="kicad" key="KiCad Tutorial 2026" en="KiCad Tutorial 2026" zh="KiCad 2026 完整教程" desc_en="One complete walkthrough with 60 annotated screenshots: schematic, DRC, PCB layout, useful tools and manufacturing outputs." desc_zh="一份完整实操指南，60 张步骤截图覆盖原理图、DRC、PCB 布局、实用工具与生产文件输出。" %}

{% include notes-group.html id="simplefoc" key="SimpleFOC Integrated Board" en="SimpleFOC Integrated Board · From Zero to One" zh="SimpleFOC 一体板 · 从零到一" desc_en="Four parts on why a tail-mounted driver board, schematic and PCB layout, first power-up and software setup, then code reading and the heartbeat indicator." desc_zh="四篇连载：为什么做尾置一体板、原理图与 PCB 布局、首次上电与软件配置、代码解读与心跳灯。" %}

{% include notes-group.html id="lora" key="LoRa Flood Sensor" en="LoRa Flood Sensor Development Series" zh="LoRa 水浸传感器开发系列" desc_en="Three parts covering the system solution, schematic design and component selection, and fitting the PCBA into a 50 mm enclosure." desc_zh="三篇连载：系统方案、原理图设计与器件选型，以及把 PCBA 装进 50 mm 外壳的布局要点。" %}

<section class="bi-notes-group" id="standalone">
  <h2 data-zh="其他工程实践">Other Build Notes</h2>
  <p class="bi-group-desc" data-zh="便携示波器 / 逻辑分析仪与 KV4P-HT 业余无线电配件的独立制作记录。">Standalone build logs for a portable oscilloscope / logic analyzer and a KV4P-HT ham radio accessory.</p>
  <div class="bi-post-list">
    {% assign standalone = "" | split: "," %}
    {% for post in site.posts %}{% unless post.series %}{% assign standalone = standalone | push: post %}{% endunless %}{% endfor %}
    {% for post in standalone %}
      <article class="bi-post-row">
        <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%b %d, %Y" }}</time>
        <div>
          <h3>
            <a href="{{ post.url | relative_url }}"{% if post.title_zh %} data-zh="{{ post.title_zh | escape }}"{% endif %}>{{ post.title }}</a>
          </h3>
          <p{% if post.excerpt_zh %} data-zh="{{ post.excerpt_zh | escape }}"{% endif %}>{{ post.excerpt | strip_html | truncate: 180 }}</p>
        </div>
      </article>
    {% endfor %}
  </div>
</section>
