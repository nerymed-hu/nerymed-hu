# Server Status

Last updated: 2026-08-10

## EC2 Instance

- **OS:** Debian 13 (Trixie) amd64
- **IP:** 52.48.130.44
- **User:** kecsi

## Installed Software

| Package | Version | Notes |
|---|---|---|
| Apache2 | 2.4.67 | Running, enabled on boot |
| Node.js | 20.19.2 (LTS) | Installed via NodeSource |
| npm | 8.19.1 | |
| Git | 2.47.3 | |
| Certbot | 4.0.0 | |

## Apache2

- **Status:** Active, running
- **Config path:** `/etc/apache2/sites-available/`
- **Enabled modules:** `proxy`, `proxy_http`, `ssl`, `rewrite`, `headers`

### Virtual Hosts

| File | Domain(s) | DocumentRoot |
|---|---|---|
| `000-default.conf` | default | — |
| `100-linuxbox.hu.conf` | linuxbox.hu | — |
| `200-kecskemethy.hu.conf` | kecskemethy.hu, www, kepek, vault, zoltan | various |
| `300-nerymed.hu.conf` | nerymed.hu, www.nerymed.hu (canonical); nerymed.kecskemethy.hu (alias, 301→nerymed.hu) | `/srv/opt/www/nerymed.hu/dist` |

## SSL Certificates (Let's Encrypt)

| Certificate | Domains | Expires |
|---|---|---|
| `kecskemethy.hu` | `*.kecskemethy.hu`, `kecskemethy.hu` | 2026-07-27 |
| `linuxbox.hu` | `*.linuxbox.hu`, `linuxbox.hu` | 2026-07-27 |
| `linuxbox.hu-0001` | `linuxbox.hu` | 2026-08-15 |
| `nerymed.hu` | `nerymed.hu` | issued via certbot 2026-08-10 (own cert, no longer riding the `*.kecskemethy.hu` wildcard) |

## NeryMed Site

- **URL:** https://nerymed.hu (production, live)
- **Status:** Live
- **DocumentRoot:** `/srv/opt/www/nerymed.hu/dist`
- **Project root:** `/srv/opt/www/nerymed.hu`
- **Vhost config:** `/etc/apache2/sites-available/300-nerymed.hu.conf`
- **DNS:** `nerymed.hu` → `52.48.130.44` (A record)
- **Legacy paths (symlinks to the canonical dir, kept for continuity, do not target directly):** `/srv/opt/www/kecskemethy.hu/nerymed.kecskemethy.hu`, `/var/www/nerymed.hu`
- **Repo:** moved from `kecsi-san/nerymed` (personal) to `nerymed-hu/nerymed-hu` (org)
- **Deploy:** automated via GitHub Actions (`.github/workflows/deploy.yml`) on every push to `main`, SSH'd in as the `nerymed` user — no longer a manual `kecsi` step (see Systemd/Ownership below)

## System User: nerymed

- `uid=1009(nerymed) gid=1009(nerymed)`, home `/home/nerymed`, shell `/bin/bash` (needs a real shell — SSH-exec commands from GitHub Actions run through it)
- Owns the entire `/srv/opt/www/nerymed.hu` tree
- `~/.ssh/authorized_keys` holds the public half of the GitHub Actions deploy key (`EC2_SSH_KEY` secret holds the private half, `EC2_USER=nerymed`)
- `kecsi` is no longer involved in deploy or in running the service

## Systemd Service: nerymed-contact

- **Unit file:** `/etc/systemd/system/nerymed-contact.service`
- **Status:** Running
- **Runs as:** `nerymed` (changed from `kecsi` 2026-08-10)
- **WorkingDirectory:** `/srv/opt/www/nerymed.hu/server`
- **EnvironmentFile:** `/srv/opt/www/nerymed.hu/server/.env`
- **Start:** `sudo systemctl start nerymed-contact`
- **Enable on boot:** `sudo systemctl enable nerymed-contact`
- **Note:** GitHub Actions deploy only rebuilds `dist/`; it does **not** restart this service. If `server/index.js` or `server/.env` changes, restart manually: `sudo systemctl restart nerymed-contact`

## Local Mail Server

- Existing SMTP server with multiple domains configured
- Nodemailer in the contact handler will relay to `localhost:25`
- No external mail service (SES, Sendgrid, etc.) needed
