# NeryMed – Todo List

Last updated: 2026-06-11

## Project setup & scaffold

- [x] Scaffold Astro project + Tailwind CSS
- [x] Create BaseLayout, Header, Footer, Nav components
- [x] Build all pages with placeholder content (11 pages)
- [x] Blog content collection config + sample post

## Assets

- [x] Download images from live nerymed.hu (logo, dr-nery, hero, blog images)
- [x] Generate favicon.ico from brand logo
- [x] Generate og-default.jpg (1200×630 Open Graph image)
- [x] Update Header and Footer to use real logo

## Content

- [x] Port real Hungarian content — Bemutatkozás
- [x] Port real Hungarian content — Életmódorvoslás: Cégeknek
- [x] Port real Hungarian content — Életmódorvoslás: Magánszemélyeknek
- [x] Port real Hungarian content — Foglalkozás-egészségügy
- [x] Port real Hungarian content — Insumed
- [ ] Fill in opening hours — Háziorvos
- [ ] Port full Adatvédelem (privacy policy) text
- [ ] Port full Cookie-tájékoztató text
- [ ] Port remaining blog posts from WordPress to `src/content/blog/*.md`

## Server wiring

- [x] Node.js contact server skeleton (Express + Nodemailer)
- [x] Fix deploy script — add `npm ci --prefix server` step
- [ ] Create `server/.env` on EC2 (copy from `server/.env.example`, fill in SMTP config)
- [ ] Start and enable systemd service: `sudo systemctl enable --now nerymed-contact`
- [ ] Test contact form end-to-end on staging (https://nerymed.kecskemethy.hu)

## SEO

- [ ] Set `site: 'https://nerymed.hu'` in `astro.config.mjs`
- [ ] Add `@astrojs/sitemap` integration (auto-generates `sitemap-index.xml`)
- [ ] Review per-page meta descriptions and Open Graph tags

## GDPR (legally required for medical site in HU)

- [ ] Cookie consent banner — must fire before any tracking scripts load

## Go-live

- [ ] Verify staging site (https://nerymed.kecskemethy.hu) looks correct
- [ ] Switch DNS: `nerymed.hu` A record → `52.48.130.44`
