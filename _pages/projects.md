---
title: "Projects"
permalink: /projects/
layout: archive
---

# Open hardware projects

Hardware designed to make useful open-source ideas easier to build, test, and use.

<div class="bi-card-grid">
{% comment %}与首页一致：pinned: true 的项目置顶，其余仍按日期倒序{% endcomment %}
{% assign sorted_projects = site.projects | sort: "date" | reverse %}
{% assign pinned_items = sorted_projects | where: "pinned", true %}
{% assign other_items = "" | split: "," %}
{% for item in sorted_projects %}{% unless item.pinned %}{% assign other_items = other_items | push: item %}{% endunless %}{% endfor %}
{% assign ordered_projects = pinned_items | concat: other_items %}
{% for item in ordered_projects %}
  {% include project-card.html item=item %}
{% endfor %}
</div>
