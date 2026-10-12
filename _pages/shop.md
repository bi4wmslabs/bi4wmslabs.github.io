---
title: "Hardware Shop"
permalink: /shop/
layout: archive
---

# Hardware shop

Design files, PCBs, DIY kits, and assembled hardware. Each product page describes exactly what is included and links to an external checkout.

<div class="bi-shop-filter-note">Digital files are delivered by the checkout provider. Physical products may require shipping and handling time; see each product page.</div>
<div class="bi-card-grid">
{% assign sorted_products = site.products | sort: "title" %}
{% for item in sorted_products %}
  {% include product-card.html item=item %}
{% endfor %}
</div>
