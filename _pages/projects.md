---
title: "Projects"
permalink: /projects/
layout: archive
---

# Open hardware projects

Hardware designed to make useful open-source ideas easier to build, test, and use.

<div class="bi-card-grid">
{% assign sorted_projects = site.projects | sort: "date" | reverse %}
{% for item in sorted_projects %}
  {% include project-card.html item=item %}
{% endfor %}
</div>
