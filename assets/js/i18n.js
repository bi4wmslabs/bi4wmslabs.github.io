/* ==========================================================================
   bi4wms — 中 / 英 切换（零改动版 v3）
   --------------------------------------------------------------------------
   位置：assets/js/i18n.js
   引入：_includes/head/custom.html

   三种生效方式，自动识别：
     ① [data-zh="中文"]          元素级，最精准，优先使用
     ② .lang-zh / .lang-en       区块级，正文写两份时用
     ③ 字典匹配                  无需改 HTML，自动翻界面文案

   特点：切回英文是【原文还原】，不是二次翻译，无翻译腔残留
   ========================================================================== */

(function () {
  "use strict";

  var KEY = "bi4wms-lang";

  /* ======================================================================
     界面字典 —— 已覆盖你首页当前出现的全部英文文案
     加词只改这里，不用动 HTML
     ====================================================================== */
  var DICT = {
    /* ---- Hero ---- */
    "OPEN HARDWARE · ENGINEERING · SMALL-BATCH PRODUCTS": "开源硬件 · 工程实践 · 小批量产品",
    "Better Hardware": "更好的硬件",
    "for Open Source.": "为开源而生。",
    "Thoughtfully designed electronics, practical engineering notes, and hardware you can build on.":
      "精心设计的电子产品、实用的工程笔记，以及可以持续构建的硬件。",
    "Explore projects": "浏览项目",
    "Shop hardware": "硬件商店",
    "Designed with care. Documented in the open.": "用心设计，过程公开。",

    /* ---- 精选项目 ---- */
    "BUILD SOMETHING USEFUL": "动手做出有用的东西",
    "Featured projects": "精选项目",
    "All projects →": "全部项目 →",
    "Explore project →": "查看项目 →",

    /* ---- 硬件商店 ---- */
    "DESIGN FILES & PHYSICAL HARDWARE": "设计文件与实体硬件",
    "Hardware shop": "硬件商店",
    "Visit shop →": "前往商店 →",
    "Details →": "详情 →",
    "Price on request": "价格面议",
    "Purchases are completed through the linked checkout provider. This site does not collect or store payment details.":
      "购买流程由外部结算平台完成，本站不收集或保存任何支付信息。",

    /* ---- 工程笔记 ---- */
    "FROM THE WORKBENCH": "来自工作台",
    "Engineering notes": "工程笔记",
    "All notes →": "全部笔记 →",

    /* ---- 关于 ---- */
    "INDEPENDENT HARDWARE ENGINEERING": "独立硬件工程",
    "Open designs. Useful documentation. Real hardware.": "开放的设计、有用的文档、真实的硬件。",
    "About bi4wms →": "关于 bi4wms →",

    /* ---- 示例内容（换成你自己的内容后，同步改这里即可）---- */
    "SimpleFOC Controller": "SimpleFOC 控制器",
    "A compact motor-control board concept for experimenting with open-source FOC and small BLDC motors.":
      "一款紧凑的电机控制板方案，用于实验开源 FOC 算法与小型无刷电机。",
    "Word Clock": "文字时钟",
    "A carefully assembled word-clock project combining custom electronics, a display panel, and open firmware.":
      "一个精心组装的文字时钟项目，结合定制电路、显示面板与开源固件。",
    "MiniMultiScope": "迷你多用示波器",
    "A compact STM32-based hardware project for exploring signal acquisition and measurement.":
      "基于 STM32 的紧凑型硬件项目，用于探索信号采集与测量。",
    "SimpleFOC Controller Design Files": "SimpleFOC 控制器设计文件",
    "A prepared design-file bundle for builders who want to fabricate and assemble the controller.":
      "为希望自行打样与组装控制器的制作者准备的设计文件包。",
    "Word Clock DIY Kit": "文字时钟 DIY 套件",
    "A DIY hardware kit for building the word clock. Confirm the exact contents before listing.":
      "用于制作文字时钟的 DIY 硬件套件，上架前请确认具体清单。",
    "From Schematic to PCB: Engineering Notes": "从原理图到 PCB：工程笔记",
    "A sample post structure for documenting component choices, layout decisions, and validation.":
      "用于记录器件选型、布局决策与验证过程的示例文章结构。",

    /* ---- 分类标签 ---- */
    "MOTOR CONTROL": "电机控制",
    "Motor Control": "电机控制",
    "DESKTOP ELECTRONICS": "桌面电子",
    "Desktop Electronics": "桌面电子",
    "TEST & MEASUREMENT": "测试与测量",
    "Test & Measurement": "测试与测量",
    "DIGITAL": "数字文件",
    "digital": "数字文件",
    "HARDWARE-KIT": "硬件套件",
    "hardware kit": "硬件套件",
    "Hardware": "硬件",

    /* ---- 导航 / 页脚 ---- */
    "Home": "首页",
    "Projects": "项目",
    "Shop": "商店",
    "Notes": "笔记",
    "About": "关于",
    "Featured": "精选",
    "Contact": "联系",
    "GitHub": "GitHub",
    "Powered by Jekyll & Minimal Mistakes.": "由 Jekyll & Minimal Mistakes 驱动。",
    "Skip to primary navigation": "跳到主导航",
    "Skip to content": "跳到正文",
    "Skip to footer": "跳到页脚",
    "Enter your search term...": "输入搜索关键词…",
    "Search": "搜索"
  };

  /* 属性型文案（placeholder / aria-label） */
  var ATTRS = [
    { sel: '[aria-label="Toggle search"]', attr: "aria-label", zh: "切换搜索" },
    { sel: '[aria-label="Toggle menu"]', attr: "aria-label", zh: "切换菜单" },
    { sel: "input.search-input", attr: "placeholder", zh: "输入搜索关键词…" }
  ];

  /* ======================================================================
     内部状态：记录原文，切回时还原
     ====================================================================== */
  var origText = new Map();     // Text 节点 → 原文
  var origEl = new Map();       // 元素 → 原 textContent
  var origAttr = new Map();     // 元素 → 原属性值

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function skipNode(n) {
    var p = n.parentNode;
    if (!p || !p.nodeName) return true;
    var t = p.nodeName.toUpperCase();
    return t === "SCRIPT" || t === "STYLE" || t === "NOSCRIPT" ||
           t === "CODE" || t === "PRE" || t === "TEXTAREA";
  }

  /* 祖先已用 data-zh 或 lang-* 区块处理的，文本模式跳过 */
  function handled(n) {
    var el = n.parentElement;
    if (!el || !el.closest) return false;
    return !!el.closest("[data-zh], .lang-zh, .lang-en");
  }

  function textNodes() {
    var out = [], tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    while (tw.nextNode()) out.push(tw.currentNode);
    return out;
  }

  /* ---------------- 切到中文 ---------------- */
  function toZh() {
    /* ① data-zh 元素级 */
    var a = document.querySelectorAll("[data-zh]");
    for (var i = 0; i < a.length; i++) {
      var el = a[i], zh = el.getAttribute("data-zh");
      if (!zh) continue;
      if (!origEl.has(el)) origEl.set(el, el.textContent);
      el.textContent = zh;
    }

    /* ② 字典匹配纯文本节点 */
    var ns = textNodes();
    for (var j = 0; j < ns.length; j++) {
      var n = ns[j];
      if (skipNode(n) || handled(n)) continue;
      var raw = n.nodeValue, t = raw.trim();
      if (!t) continue;
      var v = DICT[t];
      if (v == null) continue;
      if (!origText.has(n)) origText.set(n, raw);
      n.nodeValue = raw.replace(t, v);
    }

    /* ③ placeholder / aria-label */
    for (var k = 0; k < ATTRS.length; k++) {
      var r = ATTRS[k], list = document.querySelectorAll(r.sel);
      for (var m = 0; m < list.length; m++) {
        var e = list[m];
        if (!origAttr.has(e)) origAttr.set(e, { a: r.attr, v: e.getAttribute(r.attr) });
        e.setAttribute(r.attr, r.zh);
      }
    }

    /* ④ 日期本地化 */
    var ts = document.querySelectorAll("time, .page__meta");
    for (var p = 0; p < ts.length; p++) {
      var tm = ts[p];
      if (tm.closest("[data-zh], .lang-zh, .lang-en")) continue;
      var txt = (tm.textContent || "").trim();
      if (!txt) continue;
      var d = new Date(txt.replace(/,/g, ""));
      if (isNaN(d.getTime())) continue;
      if (!origEl.has(tm)) origEl.set(tm, tm.textContent);
      tm.textContent = d.getFullYear() + "年" + pad(d.getMonth() + 1) + "月" + pad(d.getDate()) + "日";
    }
  }

  /* ---------------- 切回英文（原文还原） ---------------- */
  function toEn() {
    origText.forEach(function (v, n) { n.nodeValue = v; });
    origEl.forEach(function (v, el) { el.textContent = v; });
    origAttr.forEach(function (o, el) {
      if (o.v == null) el.removeAttribute(o.a); else el.setAttribute(o.a, o.v);
    });
    origText.clear(); origEl.clear(); origAttr.clear();
  }

  /* ---------------- 应用 ---------------- */
  function apply(lang) {
    if (lang === "zh") toZh(); else toEn();
    var h = document.documentElement;
    h.setAttribute("data-lang", lang);
    h.lang = (lang === "zh") ? "zh-CN" : "en";
    var btns = document.querySelectorAll(".bi-lang button[data-l]");
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle("on", btns[i].getAttribute("data-l") === lang);
    }
  }

  /* ---------------- 切换按钮 ---------------- */
  function build() {
    if (document.querySelector(".bi-lang")) return;
    var w = document.createElement("div");
    w.className = "bi-lang";
    w.setAttribute("role", "group");
    w.setAttribute("aria-label", "Language");
    [["en", "EN"], ["zh", "中文"]].forEach(function (p) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("data-l", p[0]);
      b.textContent = p[1];
      b.addEventListener("click", function () {
        try { localStorage.setItem(KEY, p[0]); } catch (e) {}
        apply(p[0]);
      });
      w.appendChild(b);
    });
    var host = document.querySelector(".greedy-nav") ||
               document.querySelector(".masthead__inner-wrap") ||
               document.querySelector(".masthead");
    if (host) host.appendChild(w);
    else { w.style.cssText = "position:fixed;top:8px;right:8px;z-index:99999"; document.body.appendChild(w); }
  }

  function pick() {
    try {
      var s = localStorage.getItem(KEY);
      if (s === "zh" || s === "en") return s;
    } catch (e) {}
    return ((navigator.language || "").toLowerCase().indexOf("zh") === 0) ? "zh" : "zh";
  }

  function boot() {
    build();
    apply(pick());
  }

  function safe() {
    try { boot(); } catch (e) {
      if (window.console && console.warn) console.warn("[i18n] 未启用:", e);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", safe);
  else safe();
})();
