# Server Status

Last updated: 2026-06-11

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
| `300-nerymed.kecskemethy.hu.conf` | nerymed.kecskemethy.hu | `/srv/opt/www/kecskemethy.hu/nerymed.kecskemethy.hu/dist` |

## SSL Certificates (Let's Encrypt)

| Certificate | Domains | Expires |
|---|---|---|
| `kecskemethy.hu` | `*.kecskemethy.hu`, `kecskemethy.hu` | 2026-07-27 |
| `linuxbox.hu` | `*.linuxbox.hu`, `linuxbox.hu` | 2026-07-27 |
| `linuxbox.hu-0001` | `linuxbox.hu` | 2026-08-15 |

`nerymed.kecskemethy.hu` is covered by the `*.kecskemethy.hu` wildcard — no separate cert needed.

## NeryMed Site

- **URL:** https://nerymed.kecskemethy.hu
- **Status:** Live (holding page)
- **DocumentRoot:** `/srv/opt/www/kecskemethy.hu/nerymed.kecskemethy.hu/dist`
- **Project root:** `/srv/opt/www/kecskemethy.hu/nerymed.kecskemethy.hu`
- **Vhost config:** `/etc/apache2/sites-available/300-nerymed.kecskemethy.hu.conf`
- **DNS:** `nerymed.kecskemethy.hu` → `52.48.130.44` (A record, set 2026-06-11)

## Systemd Service: nerymed-contact

- **Unit file:** `/etc/systemd/system/nerymed-contact.service`
- **Status:** Registered, not yet started (waiting for `server/index.js` to be deployed)
- **Runs as:** `kecsi`
- **WorkingDirectory:** `/srv/opt/www/kecskemethy.hu/nerymed.kecskemethy.hu/server`
- **Start:** `sudo systemctl start nerymed-contact`
- **Enable on boot:** `sudo systemctl enable nerymed-contact`

## Local Mail Server

- Existing SMTP server with multiple domains configured
- Nodemailer in the contact handler will relay to `localhost:25`
- No external mail service (SES, Sendgrid, etc.) needed
