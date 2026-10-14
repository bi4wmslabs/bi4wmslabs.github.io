---
title: "Engineering Notes"
permalink: /notes/
layout: home
---

<section class="bi-section">
  <p class="bi-eyebrow" data-zh="来自工作台">FROM THE WORKBENCH</p>
  <h1 data-zh="工程笔记">Engineering notes</h1>
  <p class="bi-lead" data-zh="设计取舍、器件选型、PCB 布局、点亮调试，以及来自真实项目的经验教训。">Design decisions, component research, PCB layout, bring-up, debugging, and lessons from real builds.</p>
  <div class="bi-post-list">
    {% for post in site.posts %}
      <article class="bi-post-row">
        <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%b %d, %Y" }}</time>
        <div>
          <h2>
            <a href="{{ post.url | relative_url }}"{% if post.title_zh %} data-zh="{{ post.title_zh | escape }}"{% endif %}>{{ post.title }}</a>
          </h2>
          <p{% if post.excerpt_zh %} data-zh="{{ post.excerpt_zh | escape }}"{% endif %}>{{ post.excerpt | strip_html | truncate: 180 }}</p>
        </div>
      </article>
    {% endfor %}
  </div>
</section>
