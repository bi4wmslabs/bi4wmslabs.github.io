# bi4wms Open Hardware Store — Jekyll Starter

A GitHub Pages-ready starter for an independent open-hardware brand: projects, engineering notes, digital design files, PCBs, kits, and assembled products.

Built on [Minimal Mistakes](https://github.com/mmistakes/minimal-mistakes), with custom home, product-card, and product-detail layouts.

## Quick deploy

1. Download and unzip this package.
2. Create a **new public GitHub repository** named `bi4wms.github.io` (or another repository name if you want a project site).
3. Upload the contents of this folder to the repository root. Ensure `.github/workflows/pages.yml` is included.
4. In `_config.yml`, check `url`, `baseurl`, contact email, GitHub repository, and author details.
5. Commit to the `main` branch.
6. In GitHub, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**.
7. Open **Actions** and wait for “Deploy Jekyll site to GitHub Pages” to finish.
8. Visit `https://bi4wms.github.io`.

If using a repository other than `USERNAME.github.io`, set `baseurl: "/REPOSITORY_NAME"` in `_config.yml` and remove `--baseurl ""` from the workflow build command so GitHub Pages project-site paths work as expected.

## Before publishing

- Replace `YOUR_EMAIL@example.com` with your public contact address.
- Replace every `YOUR_CHECKOUT_URL` with a real hosted checkout URL.
- Replace `YOUR_PROJECT_REPOSITORY` with the real repository URL.
- Review all example prices and product claims. They are placeholders, not verified offers.
- Replace placeholder product art with your own photographs by adding images under `assets/images/products/` and setting `image:` in product front matter.
- Check licenses, included files, digital delivery, shipping, taxes, returns, warranty and support policies.
- Do not upload payment secrets, API keys, customer data, or private download links to this public repository.

## Add a product

Create a Markdown file in `_products/`, for example `_products/new-board-files.md`:

```yaml
---
title: "New Board Design Files"
short_name: "New Board"
category: "digital"
price: "$15.00"
summary: "A verified design-file bundle."
featured: true
checkout_url: "https://your-checkout-provider.example/product"
github: "https://github.com/your-org/your-project"
---
```

Add Markdown sections describing contents, compatibility, license, delivery, and support. The product page uses `_layouts/product.html`.

## Add a project

Create a Markdown file in `_projects/` with front matter such as:

```yaml
---
title: "New Open Hardware Project"
short_name: "New Project"
category: "Electronics"
featured: true
excerpt: "One-sentence project summary."
github: "https://github.com/your-org/your-project"
---
```

## Add an article

Add a dated Markdown file under `_posts/`, for example `2026-10-15-debugging-power-stage.md`. Use Jekyll's standard post front matter.

## Local preview (optional)

Install Ruby and Bundler, then run:

```bash
bundle install
bundle exec jekyll serve
```

Open `http://127.0.0.1:4000`.

## Notes

- This is a static website, not a complete ecommerce backend.
- Payment, order management, digital file delivery, shipping, and tax handling are provided by your chosen external platform.
- The checkout buttons are intentionally placeholders until you configure them.
- The GitHub Pages workflow uses GitHub Actions for deployment.
