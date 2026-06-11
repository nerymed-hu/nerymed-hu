# Deployment Guide

## Overview

- **Development** happens on your home computer
- **Production** is the EC2 server at `52.48.130.44`
- Code travels: home → GitHub → EC2 via `git pull`

---

## First-Time Setup (home computer)

```bash
git clone git@github.com:kecsi-san/nerymed.git
cd nerymed
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
cd /srv/opt/www/kecskemethy.hu/nerymed.kecskemethy.hu
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

The contact server reads `/srv/opt/www/kecskemethy.hu/nerymed.kecskemethy.hu/server/.env` on the EC2 (this file is gitignored — set it manually on the server).

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
sudo tail -f /var/log/apache2/nerymed.kecskemethy.hu-access.log
sudo tail -f /var/log/apache2/nerymed.kecskemethy.hu-error.log

# Node.js contact service
sudo journalctl -u nerymed-contact -f
```

---

## Apache Vhost

Config file: `/etc/apache2/sites-available/300-nerymed.kecskemethy.hu.conf`

After editing the vhost:

```bash
sudo apache2ctl configtest   # always verify before reloading
sudo systemctl reload apache2
```

---

## SSL Certificate

Covered by the existing `*.kecskemethy.hu` wildcard cert (Let's Encrypt).

- **Cert path:** `/etc/letsencrypt/live/kecskemethy.hu/`
- **Expires:** 2026-07-27 (auto-renews via certbot timer)
- Check renewal: `sudo certbot renew --dry-run`

---

## Future: Automated Deploy via GitHub Actions

A workflow file (`.github/workflows/deploy.yml`) can automate the EC2 deploy on every push to `main`. See `docs/plan.md` for the template. Requires adding `EC2_HOST`, `EC2_USER`, and `EC2_SSH_KEY` as GitHub repository secrets.
