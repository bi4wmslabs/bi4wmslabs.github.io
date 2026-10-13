/* =========================================================
   bi4wms · 中英切换引擎 v5
   ---------------------------------------------------------
   放到：assets/js/i18n.js
   加载：_config.yml 里加
         after_footer_scripts:
           - /assets/js/i18n.js

   ★ v5 为什么改加载方式
     v2~v4 靠 _includes/head/custom.html 的内联脚本。
     实测下来子页面没有按钮，说明那个 include 在你的站点上
     没有对子页面生效。v5 改走 _config.yml 的 after_footer_scripts，
     这是 Minimal Mistakes 4.28.1 的 _includes/scripts.html 里
     明确支持的钩子，由 default.html 在每个页面末尾输出，
     且不替换主题自带的 main.min.js。

   ★ 去重
     v5 会置位 __BI_I18N_V4__，所以即使 _includes/head/custom.html
     里那份 v4 还在，也只会建一个按钮。
     另外会清理早期版本遗留的 .bi-lang 元素。

   功能：
     1) 正文双语块：哨兵 .bi-lang-mark[data-lang] → 打 data-bi-lang → 控制 display
     2) [data-zh]        → 卡片标题/摘要等短字段
     3) [data-zh-title]  → 页面大标题 h1
     4) syncToc()        → 目录项跟随当前语言显隐
     5) DICT 兜底        → 不改卡片模板也能切现有内容

   原则：切回 EN 是「原文还原」，不是二次翻译。
   ========================================================= */
(function () {
  "use strict";

  /* ---- 去重：v4 / v5 谁先跑谁建按钮，另一个直接退出 ---- */
  if (window.__BI_I18N_DONE__ || window.__BI_I18N_V4__) return;
  window.__BI_I18N_DONE__ = true;
  window.__BI_I18N_V4__ = true;   // 让 head 里那份 v4 别再建第二个按钮

  var STORAGE_KEY = "bi4wms-lang";
  var root = document.documentElement;
  var langState = "en";

  /* ---------- 1. 定语言 ---------- */
  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { saved = null; }
  if (saved !== "zh" && saved !== "en") {
    var nav = navigator.language || navigator.userLanguage || "";
    saved = nav.toLowerCase().indexOf("zh") === 0 ? "zh" : "en";
  }
  langState = saved;
  root.setAttribute("data-lang", saved);
  root.setAttribute("lang", saved === "zh" ? "zh-CN" : "en");

  /* ---------- 2. 注入核心样式（不依赖外部 CSS / main.scss） ---------- */
  var st = document.createElement("style");
  st.id = "bi-i18n-core";
  st.textContent =
    '[data-bi-lang="zh"]{display:none!important}' +
    'html[data-lang="zh"] [data-bi-lang="en"]{display:none!important}' +
    'html[data-lang="zh"] [data-bi-lang="zh"]{display:block!important}' +
    '.bi-lang-mark{display:none!important}' +
    '.bi-lang-switch{position:fixed;right:18px;bottom:18px;z-index:9999;' +
    'display:inline-flex;align-items:center;gap:.3rem;padding:.28rem .6rem;' +
    'border:1px solid #d8dde5;border-radius:999px;background:#fff;' +
    'box-shadow:0 2px 10px rgba(16,20,28,.14);font-size:.72rem;font-weight:700;' +
    'letter-spacing:.08em;line-height:1;white-space:nowrap;user-select:none}' +
    '.bi-lang-switch button{background:none;border:0;padding:.14rem .3rem;margin:0;' +
    'cursor:pointer;color:#7b8794;font:inherit;letter-spacing:inherit;line-height:inherit}' +
    '.bi-lang-switch button:hover{color:#2463eb}' +
    '.bi-lang-switch button.is-on{color:#2463eb}' +
    '.bi-lang-switch .bi-ls-sep{color:#d8dde5}' +
    ':root[data-theme="dark"] .bi-lang-switch{background:#141a23;border-color:#232a36}' +
    '@media (max-width:480px){.bi-lang-switch{right:12px;bottom:12px}}' +
    '@media print{.bi-lang-switch{display:none!important}}';
  (document.head || document.documentElement).appendChild(st);

  /* ---------- 3. DICT 兜底（双向） ---------- */
  var DICT = [
    ["SimpleFOC Controller", "SimpleFOC 控制器"],
    ["Word Clock", "文字时钟"],
    ["MiniMultiScope", "MiniMultiScope 迷你示波器"],
    ["uPower", "uPower 电源"],
    ["SimpleFOC Controller Design Files", "SimpleFOC 控制器设计文件"],
    ["Word Clock DIY Kit", "文字时钟 DIY 套件"],
    ["Word Clock — Assembled", "文字时钟 — 成品"],
    ["Word Clock - Assembled", "文字时钟 — 成品"],
    ["uPower DIY Kit", "uPower DIY 套件"],
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
    ["Motor Control", "电机控制"],
    ["Desktop Electronics", "桌面电子"],
    ["Test & Measurement", "测试与测量"],
    ["Test and Measurement", "测试与测量"],
    ["Digital", "数字资料"],
    ["Hardware Kit", "硬件套件"],
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

  /* ---------- 4. 正文双语块 ---------- */
  function scanBlocks() {
    var i, m, lang, box;
    var marks = document.querySelectorAll(".bi-lang-mark");
    for (i = 0; i < marks.length; i++) {
      m = marks[i];
      lang = m.getAttribute("data-lang");
      if (!lang) continue;
      box = m;
      while (box && box !== document.body && box.nodeName !== "DIV") box = box.parentElement;
      if (box && box !== document.body) box.setAttribute("data-bi-lang", lang);
    }
    var legacy = document.querySelectorAll(".bi-lang-en, .bi-lang-zh");
    for (i = 0; i < legacy.length; i++) {
      box = legacy[i];
      if (box.hasAttribute("data-bi-lang")) continue;
      box.setAttribute("data-bi-lang",
        (box.classList && box.classList.contains("bi-lang-zh")) ? "zh" : "en");
    }
  }

  function applyBlocks(lang) {
    var blocks = document.querySelectorAll("[data-bi-lang]");
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      b.style.display = (b.getAttribute("data-bi-lang") === lang) ? "" : "none";
    }
  }

  /* ---------- 5. 目录同步 ---------- */
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
    var sel = ["nav.toc a", ".toc a", ".toc__menu a", "#markdown-toc a",
               "ol#markdown-toc a", "ul#markdown-toc a",
               ".sidebar__right a", ".toc-wrapper a"].join(",");
    var links;
    try { links = document.querySelectorAll(sel); } catch (e) { return; }
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var href = a.getAttribute("href") || "";
      if (href.charAt(0) !== "#") continue;
      var id = href.slice(1);
      try { id = decodeURIComponent(id); } catch (e2) {}
      if (!id) continue;
      var target = document.getElementById(id);
      if (!target) continue;
      var li = a.closest ? a.closest("li") : null;
      if (!li) continue;
      li.style.display = isInHiddenBlock(target) ? "none" : "";
    }
  }

  function syncTocSoon() {
    syncToc();
    setTimeout(syncToc, 300);
    setTimeout(syncToc, 1200);
  }

  /* ---------- 6. 短字段 / 标题 ---------- */
  function swapDataZh(lang) {
    var nodes = document.querySelectorAll("[data-zh]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var zh = el.getAttribute("data-zh");
      if (!zh) continue;
      if (!el.hasAttribute("data-en")) el.setAttribute("data-en", el.textContent);
      el.textContent = (lang === "zh") ? zh : el.getAttribute("data-en");
    }
  }

  function swapTitle(lang) {
    var marker = document.querySelector("[data-zh-title]");
    if (!marker) return;
    var zh = marker.getAttribute("data-zh-title");
    if (!zh) return;
    var h1 = document.querySelector("h1.page__title") ||
             document.querySelector(".page__title") ||
             document.querySelector(".page__content h1") ||
             document.querySelector("h1");
    if (!h1) return;
    if (!h1.hasAttribute("data-en")) h1.setAttribute("data-en", h1.textContent);
    h1.textContent = (lang === "zh") ? zh : h1.getAttribute("data-en");
  }

  function swapDict(lang) {
    var map = (lang === "zh") ? TO_ZH : TO_EN;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
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
      node.nodeValue = raw.match(/^\s*/)[0] + hit + raw.match(/\s*$/)[0];
    }
  }

  /* ---------- 7. 按钮 ---------- */
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

    /* 清掉早期版本遗留的 .bi-lang（v1），避免两个按钮 */
    var olds = document.querySelectorAll(".bi-lang");
    for (var i = 0; i < olds.length; i++) olds[i].parentNode.removeChild(olds[i]);

    var wrap = document.createElement("div");
    wrap.id = "bi-lang-switch";
    wrap.className = "bi-lang-switch";
    wrap.setAttribute("aria-label", "Language switch");
    wrap.innerHTML =
      '<button type="button" class="bi-ls-en" data-set="en">EN</button>' +
      '<span class="bi-ls-sep">|</span>' +
      '<button type="button" class="bi-ls-zh" data-set="zh">中文</button>';

    (document.body || document.documentElement).appendChild(wrap);

    wrap.addEventListener("click", function (e) {
      var b = (e.target.closest) ? e.target.closest("[data-set]") : null;
      if (!b) return;
      var lang = b.getAttribute("data-set");
      apply(lang);
      try { localStorage.setItem(STORAGE_KEY, lang); } catch (err) {}
    });
  }

  /* ---------- 8. 应用 ---------- */
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

  /* ---------- 9. 启动 ---------- */
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
