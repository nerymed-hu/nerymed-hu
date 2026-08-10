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
- **Legacy path:** `/srv/opt/www/kecskemethy.hu/nerymed.kecskemethy.hu` is now a symlink to `/srv/opt/www/nerymed.hu`, kept for continuity — treat `/srv/opt/www/nerymed.hu` as canonical for anything new
- **Repo:** moved from `kecsi-san/nerymed` (personal) to `nerymed-hu/nerymed-hu` (org)

## Systemd Service: nerymed-contact

- **Unit file:** `/etc/systemd/system/nerymed-contact.service`
- **Status:** Running
- **Runs as:** `kecsi`
- **WorkingDirectory:** `/srv/opt/www/nerymed.hu/server`
- **Start:** `sudo systemctl start nerymed-contact`
- **Enable on boot:** `sudo systemctl enable nerymed-contact`

## Local Mail Server

- Existing SMTP server with multiple domains configured
- Nodemailer in the contact handler will relay to `localhost:25`
- No external mail service (SES, Sendgrid, etc.) needed
