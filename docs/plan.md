# NeryMed Website Rebuild Plan

## Overview

Rebuild of [nerymed.hu](https://nerymed.hu) — a small private medical business site (Dr. Nery Klaudia Krisztina). The original is a WordPress installation: outdated, buggy, no admin credentials available. Goal is a clean, modern, maintainable replacement with identical functionality.

**Source site scraped:** 2026-06-11  
**Target server:** AWS EC2, Apache2  
**Target domain:** nerymed.kecskemethy.hu (staging) → nerymed.hu (production)

---

## Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| Static site generator | [Astro](https://astro.build) | HTML-first, zero JS by default, component-based, outputs pure static files |
| CSS framework | [Tailwind CSS](https://tailwindcss.com) | Rapid styling, small purged output, no custom CSS architecture needed |
| Contact form backend | Node.js + Express + Nodemailer | Lightweight SMTP relay, ~40 lines, same JS ecosystem as Astro |
| Email delivery | Local SMTP server (existing) | Already configured on server with multiple domains, no external service needed |
| Web server | Apache2 | Serves static dist/ files directly; reverse proxies /api/contact to Node.js |
| Hosting | AWS EC2 | Existing infrastructure |

### What we are NOT using
- PHP (avoided by design)
- WordPress
- AWS SES / Lambda / API Gateway (unnecessary given local SMTP)
- Third-party form services (Formspree, EmailJS)

---

## Site Content (scraped from nerymed.hu)

### Pages
1. **Bemutatkozás** — Introduction / About Dr. Nery
2. **Életmódorvoslás – Cégeknek** — Lifestyle Medicine for Companies
3. **Életmódorvoslás – Magánszemélyeknek** — Lifestyle Medicine for Individuals
4. **Foglalkozás egészségügy** — Occupational Health
5. **Háziorvos** — General Practice
6. **Insumed** — Medical Diet Therapy
7. **Blog** — Articles (vegan nutrition, athletic performance, lifestyle)
8. **Adatvédelem / Cookie** — Privacy & Cookie Policy

### Key content blocks
- Hero with three main service pillars
- Services grid (companies vs individuals)
- Doctor profile: Dr. Nery Klaudia Krisztina
- Patient testimonials (6 success stories: weight loss, insulin resistance, blood pressure, athletic performance)
- Contact form: name, company, phone, email, message
- Contact details: +36 20 462 5517, 06 23 362-291, nerymedkft@gmail.com

---

## Directory Structure

```
nerymed.kecskemethy.hu/
│
├── docs/                          ← project documentation (this file)
│   └── plan.md
│
├── src/                           ← Astro source (not served)
│   ├── layouts/
│   │   └── BaseLayout.astro       ← shared HTML shell, head, meta
│   ├── components/
│   │   ├── Header.astro           ← logo + navigation with dropdowns
│   │   ├── Footer.astro           ← contact info, links, copyright
│   │   ├── Nav.astro              ← desktop + mobile nav
│   │   ├── ContactForm.astro      ← form markup + fetch() POST logic
│   │   ├── Testimonials.astro     ← testimonial cards
│   │   └── ServiceCard.astro      ← reusable service block
│   ├── pages/
│   │   ├── index.astro            ← home / hero
│   │   ├── bemutatkozas.astro     ← about / introduction
│   │   ├── eletmodorvoslas/
│   │   │   ├── cegeknek.astro     ← lifestyle medicine – companies
│   │   │   └── maganszemelyek.astro ← lifestyle medicine – individuals
│   │   ├── foglalkozas-egeszsegugy.astro
│   │   ├── haziorvos.astro
│   │   ├── insumed.astro
│   │   ├── blog/
│   │   │   ├── index.astro        ← blog listing
│   │   │   └── [...slug].astro    ← individual post template
│   │   ├── adatvedelem.astro      ← privacy policy
│   │   └── cookie.astro           ← cookie policy
│   └── content/
│       └── blog/                  ← Markdown blog posts
│           └── *.md
│
├── public/                        ← static assets (copied as-is to dist/)
│   ├── images/
│   │   ├── logo.svg
│   │   ├── dr-nery.jpg
│   │   └── ...
│   ├── favicon.ico
│   └── robots.txt
│
├── server/                        ← Node.js contact form backend
│   ├── index.js                   ← Express app, POST /api/contact
│   ├── package.json
│   └── .env                       ← SMTP config (gitignored)
│
├── dist/                          ← Astro build output (Apache serves this)
│   └── ...                        ← generated at build time, gitignored
│
├── astro.config.mjs
├── tailwind.config.mjs
├── package.json                   ← Astro + Tailwind dependencies
├── .gitignore
└── .env                           ← local dev overrides (gitignored)
```

---

## Request Flow

```
User browser
    │
    ├── GET  /*              → Apache → dist/  (static HTML/CSS/JS)
    │
    └── POST /api/contact   → Apache (reverse proxy) → Node.js :3001
                                                            │
                                                            └── localhost SMTP → email
```

---

## Apache2 Configuration

Two directives in the vhost:

```apache
# Serve static Astro build
DocumentRoot /srv/opt/www/kecskemethy.hu/nerymed.kecskemethy.hu/dist

# Proxy contact form endpoint to Node.js
ProxyPass        /api/contact  http://127.0.0.1:3001/api/contact
ProxyPassReverse /api/contact  http://127.0.0.1:3001/api/contact
```

Modules needed: `mod_proxy`, `mod_proxy_http`

---

## Node.js Contact Handler (server/index.js outline)

```
POST /api/contact
  body: { name, company, phone, email, message }
  → validate fields
  → Nodemailer: transport to localhost:25
  → send to nerymedkft@gmail.com (or configured recipient)
  → respond 200 JSON { ok: true } or 500 { error: ... }
```

Runs as a **systemd service** (`nerymed-contact.service`) so it starts on boot and restarts on crash.

---

## Development & Deployment Workflow

### Environment split

| Environment | Machine | Role |
|---|---|---|
| Development | Home computer | All coding, Astro dev server, git commits & pushes |
| Production | AWS EC2 | Git pull, build, serve — no editing directly on server |

### What each machine needs

**Home computer (dev):**
- Node.js + npm
- Git
- Any editor (VS Code recommended — Astro extension available)
- `npm run dev` runs Astro on :4321 and Node.js server on :3001 locally

**EC2 (production only):**
- Git
- Node.js + npm (runtime for contact server + build step)
- Apache2

### Git workflow

```
home computer                   GitHub                        EC2
─────────────                   ──────                        ───
npm run dev          →
edit / build locally
git add / commit     → git push origin main  →   git pull origin main
                                                  npm ci
                                                  npm run build
                                                  sudo systemctl restart nerymed-contact
```

### Day-to-day commands

```bash
# On home computer — development
npm run dev                    # Astro :4321 + contact server :3001

# On home computer — ship a change
git add -p
git commit -m "your message"
git push origin main

# On EC2 — deploy
git pull origin main
npm ci
npm run build
sudo systemctl restart nerymed-contact
# Apache serves dist/ immediately, no Apache restart needed
```

### Future enhancement: GitHub Actions CI/CD

Once the workflow is stable, a GitHub Actions workflow can automate the EC2 deploy on every push to `main` (SSH in, run the three deploy commands). Not required to start.

```yaml
# .github/workflows/deploy.yml (future)
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to EC2
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /srv/opt/www/kecskemethy.hu/nerymed.kecskemethy.hu
            git pull origin main
            npm ci
            npm run build
            sudo systemctl restart nerymed-contact
```

### .gitignore essentials

```
node_modules/
dist/
.env
server/.env
```

`dist/` is excluded — always built fresh on EC2 from source. Never commit built output.

---

## Implementation Order

1. [ ] Scaffold Astro project + Tailwind
2. [ ] Create BaseLayout, Header, Footer, Nav components
3. [ ] Build all pages with placeholder content
4. [ ] Port actual Hungarian content from nerymed.hu (text, images)
5. [ ] Build ContactForm component + Node.js contact handler
6. [ ] Configure Apache2 vhost + systemd service
7. [ ] Test contact form end-to-end on EC2
8. [ ] SEO: meta tags, Open Graph, sitemap.xml, robots.txt
9. [ ] Port blog posts to Markdown
10. [ ] Cookie consent banner (GDPR — required for medical site in HU)
11. [ ] Switch DNS: nerymed.hu → EC2

---

## Notes & Decisions

- **No PHP** on this server by deliberate choice.
- **No third-party form services** — local SMTP keeps data in-house (relevant for medical privacy).
- **GDPR / Hungarian law**: cookie consent and privacy policy pages are mandatory. The existing site already has them — port the content.
- **SSL**: Apache should serve over HTTPS. Use Let's Encrypt (`certbot --apache`) once DNS is pointed or via staging domain first.
- **Images**: scrape from the live nerymed.hu before it goes offline; `wget` or `curl` the original WordPress media library.
