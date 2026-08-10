# Development Status

Last updated: 2026-06-11 (stale scaffold snapshot — site is now live in production; see `docs/server-status.md` and `docs/todo.md` for current state)

## Development Machine

- **OS:** Debian (WSL2 on Windows)
- **Shell:** bash
- **Node.js:** v26.0.0
- **npm:** 11.12.1
- **Git user:** Zoltan K

## Project Location

- **Local repo:** `/usr/src/github.com/kecsi-san/nerymed` (directory name is historical; repo itself moved — see Remote below)
- **Remote:** `git@github.com:nerymed-hu/nerymed-hu.git` (moved from personal `kecsi-san/nerymed` to the `nerymed-hu` org)
- **Branch:** `main`

## Scaffold Status

| Area | Status | Notes |
|---|---|---|
| Astro project | ✅ Done | v4.16, builds cleanly |
| Tailwind CSS | ✅ Done | v3.4, `@astrojs/tailwind` integration |
| `npm install` (root) | ✅ Done | 403 packages |
| `npm install` (server/) | ✅ Done | 72 packages |
| All 11 pages | ✅ Done | Build verified, see below |
| Components | ✅ Done | Header, Footer, Nav, ServiceCard, Testimonials, ContactForm |
| Blog content collection | ✅ Done | Schema defined, one placeholder post |
| Contact server | ✅ Done | Express + Nodemailer skeleton, validates input |
| Logo SVG | ✅ Placeholder | Vector placeholder; replace with real logo asset |
| `public/robots.txt` | ✅ Done | Points to sitemap |

## Pages Built

| Page | Route | Content |
|---|---|---|
| Home / hero | `/` | Placeholder — needs real copy + `dr-nery.jpg` |
| Bemutatkozás | `/bemutatkozas` | Placeholder — needs real biography |
| Életmódorvoslás – Cégeknek | `/eletmodorvoslas/cegeknek` | Placeholder |
| Életmódorvoslás – Magánszemélyeknek | `/eletmodorvoslas/maganszemelyek` | Placeholder |
| Foglalkozás-egészségügy | `/foglalkozas-egeszsegugy` | Placeholder |
| Háziorvos | `/haziorvos` | Placeholder — opening hours missing |
| Insumed | `/insumed` | Placeholder + testimonials component |
| Blog index | `/blog` | Live — renders from `src/content/blog/*.md` |
| Blog post | `/blog/[slug]` | Live — one sample post present |
| Adatvédelem | `/adatvedelem` | Skeleton — full policy text needed |
| Cookie | `/cookie` | Skeleton — full policy text needed |

## Missing Assets

| Asset | Used in | Action needed |
|---|---|---|
| `public/images/dr-nery.jpg` | Home, Bemutatkozás | Download from live nerymed.hu before it goes offline |
| `public/favicon.ico` | All pages (BaseLayout) | Provide or generate from logo |
| `public/images/og-default.jpg` | All pages (Open Graph) | Create a branded OG image |

## What Still Needs Doing (from plan.md)

4. **Port actual content** — Hungarian text + images scraped from nerymed.hu; every page has `<!-- TODO: port ... -->` markers
5. **Test contact form end-to-end** — `server/.env` must be created locally pointing to a test SMTP; contact server skeleton is ready
6. **Apache vhost already done on server** — see `docs/server-status.md`; `server/.env` still needs to be placed on EC2
7. **Start the systemd service** — unit file exists on server, waiting on `server/` to be deployed; see `docs/deploy.md`
8. **SEO** — `astro.config.mjs` needs `site:` set; add `@astrojs/sitemap` integration; OG image needed
9. **Blog posts** — port remaining posts from WordPress to `src/content/blog/*.md`
10. **Cookie consent banner** — GDPR required; not yet implemented
11. **DNS cutover** — `nerymed.hu` → `52.48.130.44` once staging is verified

## Known Gaps vs EC2 Deploy

The static site (`dist/`) is deployable now — `git push` + `npm run build` on EC2 will serve placeholder pages immediately.

The contact form is **not yet functional** end-to-end:
- `server/.env` has not been created on EC2 (needs `MAIL_TO`, `MAIL_FROM`, `SMTP_HOST`, etc.)
- The systemd service is registered on the server but not started (see `docs/server-status.md`)
- The deploy script in `docs/deploy.md` does not install `server/` dependencies; add `npm ci --prefix server` before the `sudo systemctl restart` step

## Running Locally

```bash
npm run dev        # Astro on http://localhost:4321 + contact server on http://localhost:3001
```

The contact server will fail to send mail unless `server/.env` exists with a valid SMTP target.
Copy `server/.env.example` to `server/.env` and fill in local values.
