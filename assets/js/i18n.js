/* =========================================================
   bi4wms · 中英切换引擎  v3
   ---------------------------------------------------------
   放到：assets/js/i18n.js
   引入（任选其一，都行）：
     A. _includes/head/custom.html 里加
        <script src="/assets/js/i18n.js"></script>
     B. _config.yml 里加
        footer_scripts:
          - /assets/js/i18n.js

   v3 修复：
   ★ 问题1「只有主页有按钮」
     - 按钮改为固定定位（右下角），不再依赖页面里是否找得到 masthead
     - 修正 v2 的 appendChild 逻辑错误（会把按钮从 masthead 挪走）
     - 加全局去重标志：head 与 footer 同时引入也只执行一次
   ★ 问题2「目录里中英文子标题同时在」
     - 新增 syncToc()：目录项指向的标题若在隐藏块内，就把该目录项一起隐藏
     - 在 DOMContentLoaded / load / 300ms / 1200ms 多次执行，
       兼容 Jekyll 服务端生成目录与主题 JS 客户端生成目录两种情况

   原则：切回 EN 是「原文还原」，不是二次翻译。
   ========================================================= */
(function () {
  "use strict";

  /* 全局去重：允许同一个文件被引入两次而不重复初始化 */
  if (window.__BI_I18N_V3__) return;
  window.__BI_I18N_V3__ = true;

  var STORAGE_KEY = "bi4wms-lang";
  var root = document.documentElement;
  var langState = "en";

  /* ========== 1. 定语言（尽早执行，防首屏闪） ========== */
  var saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    saved = null;
  }
  if (saved !== "zh" && saved !== "en") {
    var nav = navigator.language || navigator.userLanguage || "";
    saved = nav.toLowerCase().indexOf("zh") === 0 ? "zh" : "en";
  }
  langState = saved;
  root.setAttribute("data-lang", saved);
  root.setAttribute("lang", saved === "zh" ? "zh-CN" : "en");

  /* ========== 2. 注入核心样式（不依赖外部 CSS） ========== */
  var style = document.createElement("style");
  style.id = "bi-i18n-core";
  style.textContent =
    '[data-bi-lang="zh"]{display:none!important}' +
    'html[data-lang="zh"] [data-bi-lang="en"]{display:none!important}' +
    'html[data-lang="zh"] [data-bi-lang="zh"]{display:block!important}' +
    '.bi-lang-mark{display:none!important}';
  (document.head || document.documentElement).appendChild(style);

  /* ========== 3. DICT 兜底（英文 ⇄ 中文，双向） ========== */
  var DICT = [
    /* --- 项目 --- */
    ["SimpleFOC Controller", "SimpleFOC 控制器"],
    ["Word Clock", "文字时钟"],
    ["MiniMultiScope", "MiniMultiScope 迷你示波器"],
    ["uPower", "uPower 电源"],

    /* --- 商品 --- */
    ["SimpleFOC Controller Design Files", "SimpleFOC 控制器设计文件"],
    ["Word Clock DIY Kit", "文字时钟 DIY 套件"],
    ["Word Clock — Assembled", "文字时钟 — 成品"],
    ["Word Clock - Assembled", "文字时钟 — 成品"],
    ["uPower DIY Kit", "uPower DIY 套件"],

    /* --- 摘要 / 简介 --- */
    ["A compact motor-control board concept for experimenting with open-source FOC and small BLDC motors.",
     "用于试验开源 FOC 与小型无刷电机的紧凑型电机控制板方案。"],
    ["A carefully assembled word-clock project combining custom electronics, a display panel, and open firmware.",
     "精心组装的文字时钟项目，融合定制电路、显示面板与开源固件。"],
    ["A compact STM32-based hardware project for exploring signal acquisition and measurement.",
     "基于 STM32 的紧凑型硬件项目，用于探索信号采集与测量。"],
    ["A prepared design-file bundle for builders who want to fabricate and assemble the controller.",
     "面向希望自行打样与组装控制器的制作者的成品设计文件包。"],
    ["A DIY hardware kit for building the word clock. Confirm the exact contents before listing.",
     "用于制作文字时钟的 DIY 硬件套件。上架前请确认具体内容清单。"],
    ["A DIY hardware kit for uPower.", "uPower 的 DIY 硬件套件。"],

    /* --- 分类标签 --- */
    ["Motor Control", "电机控制"],
    ["Desktop Electronics", "桌面电子"],
    ["Test & Measurement", "测试与测量"],
    ["Test and Measurement", "测试与测量"],
    ["Digital", "数字资料"],
    ["Hardware Kit", "硬件套件"],

    /* --- 界面常用词 --- */
    ["Details →", "详情 →"],
    ["Explore project →", "查看项目 →"],
    ["All projects →", "全部项目 →"],
    ["All notes →", "全部笔记 →"],
    ["Visit shop →", "进入商店 →"],
    ["Price on request", "价格面议"]
  ];

  var TO_ZH = {}, TO_EN = {};
  for (var d = 0; d < DICT.length; d++) {
    TO_ZH[DICT[d][0]] = DICT[d][1];
    TO_EN[DICT[d][1]] = DICT[d][0];
  }

  /* ========== 4. 正文双语块 ========== */

  /* 4a. 给块打标记
     优先用哨兵 span（.bi-lang-mark[data-lang]）向上找所属 div；
     再兼容 div 自带 class 的写法。双保险，防止 kramdown 吃掉 class。 */
  function scanBlocks() {
    var i, m, lang, box;

    var marks = document.querySelectorAll(".bi-lang-mark");
    for (i = 0; i < marks.length; i++) {
      m = marks[i];
      lang = m.getAttribute("data-lang");
      if (!lang) continue;
      box = m;
      while (box && box !== document.body && box.nodeName !== "DIV") {
        box = box.parentElement;
      }
      if (box && box !== document.body) box.setAttribute("data-bi-lang", lang);
    }

    var legacy = document.querySelectorAll(".bi-lang-en, .bi-lang-zh");
    for (i = 0; i < legacy.length; i++) {
      box = legacy[i];
      if (box.hasAttribute("data-bi-lang")) continue;
      box.setAttribute(
        "data-bi-lang",
        box.classList && box.classList.contains("bi-lang-zh") ? "zh" : "en"
      );
    }
  }

  /* 4b. 直接控制显隐 —— 不依赖任何外部 CSS */
  function applyBlocks(lang) {
    var blocks = document.querySelectorAll("[data-bi-lang]");
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      b.style.display = b.getAttribute("data-bi-lang") === lang ? "" : "none";
    }
  }

  /* ========== 5. 目录（TOC）同步 ★ v3 新增 ========== */
  /* 目录项指向的标题若属于「当前不显示的语言块」，就把该目录项一起藏掉 */

  function isInHiddenBlock(el) {
    var node = el;
    while (node && node !== document.body) {
      if (node.style && node.style.display === "none") return true;
      if (node.hasAttribute && node.hasAttribute("hidden")) return true;
      var bi = node.getAttribute ? node.getAttribute("data-bi-lang") : null;
      if (bi && bi !== langState) return true;
      node = node.parentElement;
    }
    return false;
  }

  function syncToc() {
    var sel = [
      "nav.toc a", ".toc a", ".toc__menu a",
      "#markdown-toc a", "ol#markdown-toc a", "ul#markdown-toc a",
      ".sidebar__right a", ".toc-wrapper a"
    ].join(",");

    var links;
    try {
      links = document.querySelectorAll(sel);
    } catch (e) {
      return;
    }

    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var href = a.getAttribute("href") || "";
      if (href.charAt(0) !== "#") continue;

      var id = href.slice(1);
      try {
        id = decodeURIComponent(id);
      } catch (e2) {}
      if (!id) continue;

      var target = document.getElementById(id);
      if (!target) continue;

      var li = a.closest ? a.closest("li") : null;
      if (!li) continue;

      li.style.display = isInHiddenBlock(target) ? "none" : "";
    }
  }

  /* 目录可能是主题 JS 在 load 之后才生成的，所以多跑几次 */
  function syncTocSoon() {
    syncToc();
    setTimeout(syncToc, 300);
    setTimeout(syncToc, 1200);
  }

  /* ========== 6. 短字段 / 标题 ========== */

  /* [data-zh]：英文原文只存一次，切换时还原 */
  function swapDataZh(lang) {
    var nodes = document.querySelectorAll("[data-zh]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var zh = el.getAttribute("data-zh");
      if (!zh) continue;
      if (!el.hasAttribute("data-en")) el.setAttribute("data-en", el.textContent);
      el.textContent = lang === "zh" ? zh : el.getAttribute("data-en");
    }
  }

  /* [data-zh-title]：页面大标题 */
  function swapTitle(lang) {
    var marker = document.querySelector("[data-zh-title]");
    if (!marker) return;
    var zh = marker.getAttribute("data-zh-title");
    if (!zh) return;
    var h1 =
      document.querySelector("h1.page__title") ||
      document.querySelector(".page__title") ||
      document.querySelector(".page__content h1") ||
      document.querySelector("h1");
    if (!h1) return;
    if (!h1.hasAttribute("data-en")) h1.setAttribute("data-en", h1.textContent);
    h1.textContent = lang === "zh" ? zh : h1.getAttribute("data-en");
  }

  /* DICT：遍历纯文本节点，只改叶子文本，不动 HTML 结构 */
  function swapDict(lang) {
    var map = lang === "zh" ? TO_ZH : TO_EN;
    var walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    var list = [], n;
    while ((n = walker.nextNode())) list.push(n);

    for (var i = 0; i < list.length; i++) {
      var node = list[i];
      var parent = node.parentNode;
      if (!parent) continue;
      var tag = (parent.nodeName || "").toLowerCase();
      if (tag === "script" || tag === "style" || tag === "code" || tag === "pre") continue;

      var raw = node.nodeValue;
      var flat = raw.replace(/\s+/g, " ").trim();
      var hit = map[flat];
      if (hit === undefined) continue;

      var lead = raw.match(/^\s*/)[0];
      var tail = raw.match(/\s*$/)[0];
      node.nodeValue = lead + hit + tail;
    }
  }

  /* ========== 7. 切换按钮 ★ v3 改为固定定位 ========== */
  function syncButton(lang) {
    var btn = document.getElementById("bi-lang-switch");
    if (!btn) return;
    var en = btn.querySelector(".bi-ls-en");
    var zh = btn.querySelector(".bi-ls-zh");
    if (en) en.classList.toggle("is-on", lang === "en");
    if (zh) zh.classList.toggle("is-on", lang === "zh");
  }

  function buildButton() {
    if (document.getElementById("bi-lang-switch")) return;

    var wrap = document.createElement("div");
    wrap.id = "bi-lang-switch";
    wrap.className = "bi-lang-switch";
    wrap.setAttribute("aria-label", "Language switch");
    wrap.innerHTML =
      '<button type="button" class="bi-ls-en" data-set="en">EN</button>' +
      '<span class="bi-ls-sep">|</span>' +
      '<button type="button" class="bi-ls-zh" data-set="zh">中文</button>';

    /* 固定定位挂到 body 末尾 —— 任何页面、任何布局都一定出现 */
    document.body.appendChild(wrap);

    wrap.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("[data-set]") : null;
      if (!b) return;
      var lang = b.getAttribute("data-set");
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch (err) {}
      apply(lang);
    });
  }

  /* ========== 8. 应用 ========== */
  function apply(lang) {
    langState = lang;
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang === "zh" ? "zh-CN" : "en");
    if (!document.body) return;
    scanBlocks();
    applyBlocks(lang);
    swapDict(lang);
    swapTitle(lang);
    swapDataZh(lang);
    syncToc();
    syncButton(lang);
  }

  /* ========== 9. 启动 ========== */
  function boot() {
    buildButton();
    apply(saved);
    syncTocSoon();
    window.addEventListener("load", function () {
      scanBlocks();
      applyBlocks(langState);
      syncTocSoon();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
