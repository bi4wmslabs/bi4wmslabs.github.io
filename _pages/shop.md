---
title: "Hardware Shop"
permalink: /shop/
layout: archive
---

# Hardware shop

Design files, PCBs, DIY kits, and assembled hardware. Each product page describes exactly what is included and links to an external checkout.

<div class="bi-shop-filter-note">Digital files are delivered by the checkout provider. Physical products may require shipping and handling time; see each product page.</div>
<div class="bi-card-grid">
{% comment %}与首页一致：pinned: true 的商品置顶，其余仍按标题升序{% endcomment %}
{% assign sorted_products = site.products | sort: "title" %}
{% assign pinned_items = sorted_products | where: "pinned", true %}
{% assign other_items = "" | split: "," %}
{% for item in sorted_products %}{% unless item.pinned %}{% assign other_items = other_items | push: item %}{% endunless %}{% endfor %}
{% assign ordered_products = pinned_items | concat: other_items %}
{% for item in ordered_products %}
  {% include product-card.html item=item %}
{% endfor %}
</div>
