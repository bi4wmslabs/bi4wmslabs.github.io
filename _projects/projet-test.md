---
title: "project test"
title_zh: "项目测试"
date: 2026-10-15
categories: [Hardware]
excerpt: "English one-line summary."
excerpt_zh: "中文一句话摘要。"
---

<div class="lang-zh">

## 中文正文

中文内容写这里。Markdown 全部可用：列表、表格、代码、图片。

- 要点一
- 要点二

| 参数 | 数值 |
|---|---|
| 输入电压 | 12–48 V |

```c
// 代码块不受语言切换影响
int main(void) { return 0; }
```

</div>

<div class="lang-en">

## English Body

English content here. Markdown works normally: lists, tables, code, images.

- Point one
- Point two

| Parameter | Value |
|---|---|
| Input voltage | 12–48 V |

```c
// Code blocks are not affected by language switching
int main(void) { return 0; }
```

</div>

---

## 使用提醒

1. 两个 `<div>` **内部都要留空行**，否则里面的 Markdown 不会被渲染成 HTML。
2. front matter 加 `title_zh` / `excerpt_zh`，列表页标题也能跟着切换。
3. 只想写一种语言时，删掉另一个 `<div>`，剩下的那份会始终显示。
4. 代码块、价格、型号、URL 两种语言共用即可，不用各写一份。
