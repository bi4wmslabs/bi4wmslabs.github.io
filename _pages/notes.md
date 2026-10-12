---
title: "Engineering Notes"
permalink: /notes/
layout: home
---

<section class="bi-section">
  <p class="bi-eyebrow">FROM THE WORKBENCH</p>
  <h1>Engineering notes</h1>
  <p class="bi-lead">Design decisions, component research, PCB layout, bring-up, debugging, and lessons from real builds.</p>
  <div class="bi-post-list">
    {% for post in site.posts %}
      <article class="bi-post-row">
        <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%b %d, %Y" }}</time>
        <div><h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2><p>{{ post.excerpt | strip_html | truncate: 180 }}</p></div>
      </article>
    {% endfor %}
  </div>
</section>
