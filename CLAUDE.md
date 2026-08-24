# NeryMed — Claude Code Instructions

## Project Overview

Astro/Tailwind site for **nerymed.hu** — a small private medical practice site for Dr. Nery Klaudia Krisztina (Érd, Hungary). The build is complete and live; nerymed.hu serves this site directly. Further work here is maintenance/incremental changes, not a from-scratch build.

**Production:** nerymed.hu (AWS EC2) — live since 2026-08-10. Server IP, deploy-key setup, and systemd service layout live in a separate private repo, not here.
**Repo:** `git@github.com:nerymed-hu/nerymed-hu.git`

---

## CRITICAL: Deployment Rule

**After every file change: commit and push immediately.**

The EC2 server deploys by running `git pull && npm run build`. Changes that are only in the working tree never reach the server. Never leave a session with uncommitted edits.

```bash
git add src/pages/whatever.astro public/images/whatever.jpg
git commit -m "fix: description of change"
git push
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Static site generator | Astro v4 |
| CSS | Tailwind CSS v3 |
| Contact form backend | Node.js + Express + Nodemailer (`server/`) |
| Web server | Apache2 (serves `dist/`, reverse-proxies `/api/contact`) |
| Hosting | AWS EC2 |

**Do not** add PHP, third-party form services, or a CMS. Keep it static + one tiny Node server.

---

## Key Files

| File | Purpose |
|---|---|
| `src/layouts/BaseLayout.astro` | HTML shell, `<head>`, Google Fonts, ekit icon CSS |
| `src/components/Header.astro` | Logo + Nav + CTA button |
| `src/components/Nav.astro` | Desktop dropdown + mobile nav |
| `src/components/Footer.astro` | Three-column + dark copyright bar |
| `src/components/ContactForm.astro` | Form with fetch() POST to `/api/contact` |
| `src/components/Testimonials.astro` | Patient success stories |
| `src/pages/index.astro` | Homepage (hero slider, services, testimonials) |
| `src/pages/dr-nery-klaudia-orvos-bemutatkozas.astro` | About Dr. Nery |
| `src/pages/eletmodorvoslas-a-cegek-eleteben.astro` | Lifestyle medicine — companies |
| `src/pages/eletmodorvoslas-az-egyenek-eleteben.astro` | Lifestyle medicine — individuals |
| `src/pages/foglalkozas-egeszsegugy.astro` | Occupational health |
| `src/pages/haziorvos.astro` | General practice |
| `src/pages/insumed.astro` | Insumed diet therapy |
| `src/pages/blog/[...slug].astro` | Blog posts (content in `src/content/blog/`) |
| `tailwind.config.mjs` | Extends blue-900 to `#0F4469` |
| `server/index.js` | POST /api/contact handler |

---

## Design System

The established design system for the site. Use as the source of truth for any future page work.

### Content Width

- **Max content width: 1200px**
- Use `container mx-auto px-4 max-w-[1200px]` for standard sections
- Use `max-w-5xl` (1024px) for text-heavy sections that feel too wide at 1200px
- Full-bleed sections (hero, footer) span 100% width; inner content is still constrained

### Color Palette

| Role | Tailwind class | Hex |
|---|---|---|
| Navy / dark headings | `blue-900` | `#0F4469` (custom in tailwind.config) |
| Blue icon circles / buttons | `blue-600` | `#2563EB` (do not change to navy) |
| Blue mid (links, hover) | `blue-700` | `#1D4ED8` |
| Blue light section bg | `blue-50` | `#EFF6FF` |
| Orange accent (buttons, labels, active nav) | `orange-500` | `#F97316` |
| Body text | `gray-800` | `#1F2937` |
| Muted text | `gray-500` / `gray-600` | — |
| Divider / border | `gray-200` | `#E5E7EB` |
| Footer dark bar | `bg-[#0F4469]` | `#0F4469` |

### Typography

- Font: **Inter** (Google Fonts) — a deliberate choice; do not change
- Line-height: `leading-relaxed` (1.625) for body paragraphs
- Heading sizes: `text-5xl` hero / `text-4xl` h2 / `text-3xl` h3 / `text-2xl`–`text-xl` sub-headings / `text-base` body
- Section eyebrow labels (e.g. "Ismerj meg!"): `text-orange-500 font-semibold text-sm uppercase tracking-widest`
- Section h2 headings: `text-3xl lg:text-4xl font-bold text-blue-900`

### Buttons

- Shape: **pill** (`rounded-full`) — never square or slightly-rounded
- Primary CTA: `bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-full`
- Secondary / page-level CTA: `bg-orange-500 hover:bg-blue-900 text-white` (hover flips to navy on some pages)

### Spacing & Layout

- Section vertical padding: `py-20`; do not go below `py-16`
- Standard horizontal gutter: `px-4` with `container mx-auto`
- Two-column sections: `flex flex-col lg:flex-row gap-12 lg:gap-16`
- Card grid: `grid grid-cols-1 md:grid-cols-2 gap-6` or `md:grid-cols-3 gap-8`

### Images

- **White border on portrait images:** `border-[10px] border-white shadow-xl` (a consistent element across the site)
- Use `object-cover object-top` for portrait/face photos
- Background section images always use absolute positioning + `w-full h-full object-cover`

### Header

- Sticky, white/translucent: `sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100`
- Height: `h-16` (64px) desktop
- Logo left, nav center, orange "Kapcsolat" button right
- Active nav item: `text-orange-500`

### Footer

- Background: `footer-bg.png` image with gradient overlay `rgba(255,255,255,0.93) → rgba(216,239,255,0.92)`
- Three columns: Brand+social / Oldalak / Blog cikkeink
- Bottom copyright bar: `bg-[#0F4469]` dark navy, gray-300 text

### Icons

Custom circular SVG icons (112.5×112.5 viewBox, `blue-600` fill circle background + white paths). Prefer inline SVG (`set:html`) — `dr-nery-klaudia-orvos-bemutatkozas.astro` has an example with the 6 lifestyle pillar icons. Some pages still use the ekit icon font (`/fonts/elementskit.woff`) as an approximation; replace with inline SVGs when the exact icon is available.

---

## Page Work Workflow

For any visual fix or new section, match the Design System values above.

1. Identify the change needed
2. Fix in the `.astro` source file, following Design System conventions
3. Commit + push immediately
4. Verify on the live URL after deploy

Do not batch multiple page fixes into one commit — one fix per commit makes it easy to bisect issues.

---

## Contact Form

- POST to `/api/contact` (proxied by Apache to Node.js on port 3001)
- Fields: name, company, phone, email, message
- Backend: `server/index.js` — runs as a systemd service on the production host
- `.env` in `server/` holds SMTP config + recipient addresses (gitignored) — see `server/.env.example` for the shape

---

## What NOT to do

- Do not commit `dist/` (it's gitignored and built fresh on EC2)
- Do not commit `.env` or `server/.env`
- Do not add new npm packages without good reason
- Do not change fonts from Inter — it's an intentional simplification
- Do not use `max-w-3xl` or narrower for full page sections (too narrow vs the original design)
