# NeryMed — Claude Code Instructions

## Project Overview

This is the Astro/Tailwind rebuild of **nerymed.hu** — a small private medical practice site for Dr. Nery Klaudia Krisztina (Érd, Hungary). The original is a WordPress/Elementor installation. The goal is a pixel-faithful static replacement with identical design, content, and imagery.

**Production:** nerymed.hu (AWS EC2, 203.0.113.10) — live since 2026-08-10  
**Repo:** `git@github.com:nerymed-hu/nerymed-hu.git` (moved from the `kecsi-san` personal account to the `nerymed-hu` GitHub org)

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
| `src/components/Testimonials.astro` | Six patient success stories |
| `src/pages/index.astro` | Homepage (hero slider, services, testimonials) |
| `src/pages/bemutatkozas.astro` | About Dr. Nery |
| `src/pages/eletmodorvoslas/cegeknek.astro` | Lifestyle medicine — companies |
| `src/pages/eletmodorvoslas/maganszemelyek.astro` | Lifestyle medicine — individuals |
| `src/pages/foglalkozas-egeszsegugy.astro` | Occupational health |
| `src/pages/haziorvos.astro` | General practice |
| `src/pages/insumed.astro` | Insumed diet therapy |
| `tailwind.config.mjs` | Extends blue-900 to `#0F4469` |
| `server/index.js` | POST /api/contact handler |

---

## Design System

The following values were reverse-engineered from the original WordPress/Elementor site. Use these as the source of truth when fixing pages.

### Content Width

- **Max content width: 1200px** (WP Elementor setting)
- Use `container mx-auto px-4 max-w-[1200px]` for standard sections
- Use `max-w-5xl` (1024px) for text-heavy sections that feel too wide at 1200px
- Full-bleed sections (hero, footer) span 100% width; inner content is still constrained

### Color Palette

| Role | WP Original | Tailwind class | Hex |
|---|---|---|---|
| Navy / dark headings | `--e-global-color-primary` | `blue-900` | `#0F4469` (custom in tailwind.config) |
| Blue icon circles / buttons | `#0384ce` | `blue-600` (≈) | `#2563EB` (Tailwind default) |
| Blue mid (links, hover) | `--e-global-color-secondary` | `blue-700` | `#1D4ED8` |
| Blue light section bg | `#F6FBFF` | `blue-50` | `#EFF6FF` (≈) |
| Orange accent (buttons, labels, active nav) | `--e-global-color-accent` | `orange-500` | `#F97316` |
| White | `#FFFFFF` | `white` | `#FFFFFF` |
| Body text | `#333333` | `gray-800` | `#1F2937` (≈) |
| Muted text | — | `gray-500` / `gray-600` | — |
| Divider / border | `#DADADA` | `gray-200` | `#E5E7EB` (≈) |
| Footer dark bar | same as navy | `bg-[#0F4469]` | `#0F4469` |

**Icon circle background in WP:** `#0384ce` (a medium bright blue, lighter than navy).  
We use `bg-blue-600` which is close enough; do not change to navy.

### Typography

- **WP original fonts:** Roboto (body) + Jost (headings) — both Google Fonts
- **This rebuild uses:** Inter (Google Fonts) — an intentional simplification; do not change
- Line-height: `leading-relaxed` (1.625) for body paragraphs
- Heading sizes from WP: 47px hero / 35px h2 / 30px h3 / 26–25px sub-headings / 16px body
- Tailwind equivalents: `text-5xl` / `text-4xl` / `text-3xl` / `text-2xl` / `text-xl` / `text-base`
- **Section eyebrow labels** (e.g. "Ismerj meg!"): `text-orange-500 font-semibold text-sm uppercase tracking-widest`
- **Section h2 headings:** `text-3xl lg:text-4xl font-bold text-blue-900`

### Buttons

- Shape: **pill** (`rounded-full`) — WP uses `border-radius: 30px`
- Primary CTA: `bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-full`
- Secondary / page-level CTA: `bg-orange-500 hover:bg-blue-900 text-white` (hover flips to navy on some pages)
- Never use square or slightly-rounded buttons — always `rounded-full`

### Spacing & Layout

- Section vertical padding: `py-20` (80px) — WP uses ~100px, py-20 is close enough; do not go below py-16
- Standard horizontal gutter: `px-4` with `container mx-auto`
- Two-column sections: `flex flex-col lg:flex-row gap-12 lg:gap-16`
- Card grid: `grid grid-cols-1 md:grid-cols-2 gap-6` or `md:grid-cols-3 gap-8`

### Images

- **White border on portrait images:** `border-[10px] border-white shadow-xl` (10px white border is a signature WP style)
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

---

## Per-Page Reference

When fixing a page, first look at the live WP original for the correct layout. The WP URLs are:

| Our page | WP original URL |
|---|---|
| `/` | `https://nerymed.hu` |
| `/bemutatkozas` | `https://nerymed.hu/bemutatkozas-2/` (slug may vary) |
| `/eletmodorvoslas/cegeknek` | `https://nerymed.hu/eletmodorvoslas/cegeknek/` |
| `/eletmodorvoslas/maganszemelyek` | `https://nerymed.hu/eletmodorvoslas/maganszemelyek/` |
| `/foglalkozas-egeszsegugy` | `https://nerymed.hu/foglalkozas-egeszsegugy/` |
| `/haziorvos` | `https://nerymed.hu/haziorvos/` |
| `/insumed` | `https://nerymed.hu/insumed/` |

### Icons

The WP site uses custom circular SVG icons (112.5×112.5 viewBox, `#0384ce` fill circle background + white paths).  
`bemutatkozas.astro` already has the 6 lifestyle pillar SVGs inline via `set:html`.  
Other pages still use ekit icon font approximations — replace with inline SVGs when available.

Ekit icon font is available via `/fonts/elementskit.woff`. Use only for icons where the exact SVG isn't available.

---

## Design Matching Workflow

When checking/fixing a page:
1. Open the WP original in a browser (or compare a screenshot)
2. Identify differences: wrong color, wrong layout, missing image, wrong font size, missing section
3. Fix in the `.astro` source file
4. Commit + push immediately
5. Trigger a deploy on EC2 and verify on the live URL

Do not batch multiple page fixes into one commit — one fix per commit makes it easy to bisect issues.

---

## Contact Form

- POST to `/api/contact` (proxied by Apache to Node.js on port 3001)
- Fields: name, company, phone, email, message
- Recipient: `nerymedkft@gmail.com`
- Backend: `server/index.js` — runs as `nerymed-contact` systemd service
- `.env` in `server/` holds SMTP config (gitignored)

---

## What NOT to do

- Do not commit `dist/` (it's gitignored and built fresh on EC2)
- Do not commit `.env` or `server/.env`
- Do not add new npm packages without good reason
- Do not change fonts from Inter — it's an intentional simplification
- Do not use `max-w-3xl` or narrower for full page sections (too narrow vs WP original)
- Do not leave changes uncommitted at end of session
