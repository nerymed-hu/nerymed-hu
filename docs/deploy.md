# Deployment Guide

## Overview

- **Development** happens on your home computer
- **Production** is the EC2 server at `52.48.130.44`
- Code travels: home → GitHub → EC2 via `git pull`

---

## First-Time Setup (home computer)

```bash
git clone git@github.com:nerymed-hu/nerymed-hu.git
cd nerymed-hu
npm install
```

---

## Day-to-Day Development

```bash
npm run dev        # Astro dev server on http://localhost:4321
                   # Node.js contact server on http://localhost:3001
```

Edit files, commit, push:

```bash
git add -p
git commit -m "your message"
git push origin main
```

---

## Deploying to EC2

SSH into the server, then:

```bash
cd /srv/opt/www/nerymed.hu
git pull origin main
npm ci
npm ci --prefix server
npm run build
find dist -type d -exec chmod 755 {} \; && find dist -type f -exec chmod 644 {} \;
sudo systemctl restart nerymed-contact
```

Apache serves `dist/` directly — no Apache restart needed after a build.

> **Note:** The `chmod` step is required because Astro recreates `dist/` on every build and the new files inherit the umask (770), which blocks Apache's `www-data` user. The find+chmod lines fix this.

### First deploy only (start and enable the contact service)

```bash
sudo systemctl enable nerymed-contact
sudo systemctl start nerymed-contact
sudo systemctl status nerymed-contact
```

---

## Environment Variables

The contact server reads `/srv/opt/www/nerymed.hu/server/.env` on the EC2 (this file is gitignored — set it manually on the server).

```bash
# server/.env
SMTP_HOST=localhost
SMTP_PORT=25
MAIL_TO=nerymedkft@gmail.com
MAIL_FROM=noreply@nerymed.hu
PORT=3001
```

On your home computer, create `server/.env` pointing to your local mail setup for testing.

---

## Checking Logs

```bash
# Apache access + errors
sudo tail -f /var/log/apache2/nerymed.hu-access.log
sudo tail -f /var/log/apache2/nerymed.hu-error.log

# Node.js contact service
sudo journalctl -u nerymed-contact -f
```

---

## Apache Vhost

Config file: `/etc/apache2/sites-available/300-nerymed.hu.conf`

`ServerAlias` still includes `nerymed.kecskemethy.hu` and `www.nerymed.hu` — both redirect (301) to the canonical `nerymed.hu` host. DocumentRoot: `/srv/opt/www/nerymed.hu/dist`.

After editing the vhost:

```bash
sudo apache2ctl configtest   # always verify before reloading
sudo systemctl reload apache2
```

---

## SSL Certificate

Own Let's Encrypt cert for `nerymed.hu` (issued via certbot, no longer relying on the `*.kecskemethy.hu` wildcard).

- **Cert path:** `/etc/letsencrypt/live/nerymed.hu/`
- Check renewal: `sudo certbot renew --dry-run`

---

## Automated Deploy via GitHub Actions

`.github/workflows/deploy.yml` deploys the EC2 box on every push to `main` — this is the live/primary deploy path as of 2026-08-10, not a future item. It SSHes into the box as the `nerymed` system user (via `appleboy/ssh-action`, credentials in the `EC2_HOST` / `EC2_USER=nerymed` / `EC2_SSH_KEY` repo secrets) and runs `git fetch && git reset --hard && npm run build` + the dist chmod fix.

**By design**, the workflow only rebuilds the static `dist/`. It deliberately does not run `npm ci` or touch `nerymed-contact` — server-side changes (`package.json` deps, `server/index.js`, `server/.env`) are applied and restarted by hand on the box (`sudo systemctl restart nerymed-contact`), not automated. Keep it that way unless explicitly asked to change it.

### Gotcha: org "Deploy keys" policy blocks git access with a misleading error

The `nerymed` user's own git-to-GitHub auth (separate from `EC2_SSH_KEY`, which only gets Actions *into* the box) uses a **deploy key** registered on the `nerymed-hu/nerymed-hu` repo (`~nerymed/.ssh/id_ed25519`, read-only). New GitHub orgs default to **Settings → Deploy keys → Disabled** org-wide (`deploy_keys_enabled_for_repositories: false` via the API).

When that's disabled, `git fetch`/`git pull` using that key fails with:
```
ERROR: Repository not found.
fatal: Could not read from remote repository.
```
— identical to the error for a genuinely missing/inaccessible repo. Every other signal looks fine (`ssh -T git@github.com` authenticates and shows `Hi nerymed-hu/nerymed-hu!`, the deploy key API shows `verified: true`, the repo isn't archived/disabled) — the org policy is the one thing none of those checks surface. If `git fetch` fails on the server with this exact error despite the deploy key looking correctly registered, check **org Settings → Deploy keys** first before re-registering/regenerating anything.
