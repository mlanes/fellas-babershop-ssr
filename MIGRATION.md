# Migration: Wix DNS + Netlify → Hetzner + Coolify + Cloudflare

A step-by-step runbook for moving `fellasbarber.com` off Netlify onto a
self-hosted stack that can also host the future fullstack app and any
side projects.

**Players in the current setup:**

- **Wix** — domain registrar (where `fellasbarber.com` is bought) **and**
  the current DNS nameservers (`ns0.wixdns.net`, `ns1.wixdns.net`)
- **Netlify** — current host (served `fellasbarber.com` until cutover)

**Target stack:**

- **Wix** — keeps being the registrar (no domain transfer, just nameserver change)
- **Cloudflare** — new DNS authority + global edge CDN + DDoS protection
- **Hetzner Cloud** — VPS (Ubuntu 26.04) hosting everything
- **Coolify** — self-hosted PaaS managing apps on the VPS

**Total monthly cost: ~€5.50** regardless of how many projects you host.

---

## What's already done (as of cutover prep)

- ✅ Hetzner CX22 provisioned at Falkenstein (IPv4 `178.105.204.69`)
- ✅ SSH hardened: password auth off, fail2ban + unattended-upgrades installed
- ✅ Hetzner Cloud Firewall: only TCP 22 / 80 / 443 inbound
- ✅ 4 GB swap file (persisted in `/etc/fstab`) — required for Nuxt's Vite-build memory peak
- ✅ Coolify v4.1 installed; admin account created (password should be rotated to a strong random one)
- ✅ Coolify GitHub App connected to `mlanes/fellas-babershop-ssr`
- ✅ Repo prep merged to `main` (`nuxt.config.ts` preset auto-detect, `engines.node`, `npm start` script)
- ✅ App deployed at a temporary URL: `http://aakq18qlhgajdh7miealgb0r.178.105.204.69.sslip.io/`
- ✅ Verified: HTTP 200, ~66ms TTFB, image provider switched to IPX (no Netlify references in output HTML)

What's left = Cloudflare + the actual cutover.

---

## Phase 1 — Provision the Hetzner VPS

### 1.1 Sign up & create a project

- [console.hetzner.cloud](https://console.hetzner.cloud) → sign up, add
  payment method
- Top-left → **New Project** → name: `personal`

### 1.2 SSH key (already done)

The key `~/.ssh/id_ed25519_hetzner` was generated and added in
_Security → SSH Keys_ as `mario-hetzner`.

### 1.3 Create the server

_Servers → Add Server_:

| Field            | Choice                                                                 |
| ---------------- | ---------------------------------------------------------------------- |
| Location         | **Falkenstein** (closest to Lisbon)                                    |
| Image            | **Ubuntu 24.04**                                                       |
| Type             | **Shared vCPU → CX22** (€4.51/mo: 2 vCPU, 4 GB RAM, 40 GB SSD)         |
| Networking       | IPv4 + IPv6 (default)                                                  |
| SSH Keys         | tick `mario-hetzner`                                                   |
| Volumes          | none                                                                   |
| Firewalls        | (will create in 1.4)                                                   |
| Backups          | optional (~20% surcharge); enable if you want hourly off-box snapshots |
| Placement Groups | none                                                                   |
| Labels           | optional, e.g. `role=coolify`                                          |
| Name             | `coolify-1`                                                            |

→ **Create & Buy now**.

Note the IPv4 address; everything below uses `178.105.204.69` as a stand-in.

### 1.4 Firewall

_Firewalls → New Firewall_ — inbound rules only:

| Port | Protocol | Source                                                            |
| ---- | -------- | ----------------------------------------------------------------- |
| 22   | TCP      | Any IPv4 + IPv6 (or restrict to your IP if you have a static one) |
| 80   | TCP      | Any                                                               |
| 443  | TCP      | Any                                                               |

Attach to the `coolify-1` server. Do **not** open 8000 publicly — we'll
expose Coolify via a real domain (HTTPS) and keep dashboard traffic off
the public internet.

---

## Phase 2 — First login & basic hardening

```bash
# Add the SSH config entry on your laptop (one-time):
cat >> ~/.ssh/config <<EOF

Host hetzner-coolify
  HostName 178.105.204.69
  User root
  IdentityFile ~/.ssh/id_ed25519_hetzner
EOF

# Connect:
ssh hetzner-coolify
```

Run this hardening one-liner on the VPS (once):

```bash
# Disable password auth (you have SSH key only)
sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#*PermitRootLogin.*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
systemctl restart ssh

# Automatic security updates
apt update && apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

# fail2ban for brute-force SSH protection
apt install -y fail2ban
systemctl enable --now fail2ban
```

That's the minimum. (Optional: create a non-root user with sudo; not
strictly necessary on a Coolify-only box.)

---

## Phase 3 — Install Coolify

Still on the VPS:

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Takes ~5 minutes. Installs Docker, Coolify itself, Traefik (reverse
proxy + auto-HTTPS). When done it prints:

```
Coolify is installed and running at http://178.105.204.69:8000
```

Open that URL in your browser, create the admin account (this is _your_
private Coolify — no shared anything). Save the credentials.

### 3.1 Expose Coolify dashboard on a real domain

In Coolify: **Settings → General**

- _Instance's Domain_: `coolify.fellasbarber.com`

Add a Cloudflare DNS record (Phase 4 below) for that subdomain pointing
at `178.105.204.69`, then in Coolify hit _Save_ — it'll issue a Let's Encrypt
cert via Traefik. Now `https://coolify.fellasbarber.com` works.

Once that's working, you can remove port 8000 from the firewall — all
dashboard traffic goes through HTTPS on 443.

---

## Phase 4 — Cloudflare in front (DNS authority moves Wix → Cloudflare)

> **Domain stays at Wix** (Wix remains the registrar). Only the
> **nameservers** change so Cloudflare answers DNS queries instead of
> Wix. No domain transfer, no risk to ownership.

### 4.1 Add the domain to Cloudflare

- Sign up / log in at [cloudflare.com](https://cloudflare.com) (free tier)
- Top-right → **Add a Site** → enter `fellasbarber.com` → **Free** plan
- Cloudflare scans the current Wix DNS records and **imports them
  automatically** (including the A record pointing at Netlify). This is
  the safety net: when you swap nameservers, the live site keeps
  working because Cloudflare now answers the same way Wix did.
- Cloudflare gives you **two nameservers** that look like
  `xxx.ns.cloudflare.com` / `yyy.ns.cloudflare.com`. **Note them down.**

### 4.2 Change the nameservers at Wix

- Log into [manage.wix.com](https://manage.wix.com) → **Domains**
- Click `fellasbarber.com` → **Advanced** (or **DNS Settings**) →
  look for **"Change nameservers"** / **"Use external nameservers"** /
  **"Custom nameservers"**
- Replace Wix's two (`ns0.wixdns.net`, `ns1.wixdns.net`) with Cloudflare's two
- Save / Confirm

Wix sometimes warns "you'll lose access to Wix DNS management" — that's
exactly the intent. If Wix tries to upsell you on keeping their DNS,
ignore.

Propagation: usually 5–30 minutes, up to 24 hours in the worst case.
Cloudflare emails you when it detects the change. Verify yourself with:

```bash
dig +short NS fellasbarber.com
# should return *.ns.cloudflare.com, not *.wixdns.net
```

### 4.3 DNS records in Cloudflare

In the Cloudflare **DNS** tab, set these records (keep `@` and `www`
pointing at Netlify for now — we cut those over in Phase 7):

| Type         | Name      | Content                  | Proxy          |
| ------------ | --------- | ------------------------ | -------------- |
| A            | `coolify` | `178.105.204.69`         | 🟠 **Proxied** |
| A            | `preview` | `178.105.204.69`         | 🟠 **Proxied** |
| (existing) A | `@`       | (Netlify's IP, imported) | 🟠 Proxied     |
| (existing) A | `www`     | (Netlify's IP, imported) | 🟠 Proxied     |

Proxied (🟠 orange cloud) is what gives you the edge CDN, DDoS
protection, and hides the VPS IP from public view.

### 4.4 SSL / TLS settings

In Cloudflare **SSL/TLS → Overview**:

- Mode: **Full (strict)** — Cloudflare ↔ origin uses the Let's Encrypt
  cert that Coolify provisions. Don't use Flexible (it sends plain HTTP
  to the origin).

In **SSL/TLS → Edge Certificates**:

- _Always Use HTTPS_: **On**
- _Automatic HTTPS Rewrites_: **On**
- _Minimum TLS Version_: 1.2

In **Rules → Page Rules** (or _Caching → Cache Rules_):

- Optionally cache `/_nuxt/*` aggressively (1 year) — Nuxt asset
  hashing makes this safe.

---

## Phase 5 — Code changes (already in this repo)

Nothing for you to do here — this PR/branch includes:

- `nuxt.config.ts`: removed the explicit `nitro.preset: 'netlify'` so
  Nitro auto-detects per host (Netlify when building on Netlify,
  Node server everywhere else)
- `package.json`: added `engines.node: ">=20.0.0"` so Coolify's Nixpacks
  buildpack picks the right Node version
- `@nuxt/image`: no change needed — auto-falls-back to IPX on a Node
  deploy, which serves WebP/AVIF + resize from the same Node process

---

## Phase 6 — Deploy the site to Coolify

### 6.1 Connect GitHub

In Coolify: _Sources → New Source → GitHub App_ → install the Coolify
GitHub app on your `mlanes` account, grant access to
`fellas-babershop-ssr`.

### 6.2 Create the project

_Projects → New Project_ → name: `fellas-barbershop` → Environment:
`production`.

### 6.3 Add the resource

_+ New Resource → Public Repository (or Private via the GitHub app)_:

- Repository: `mlanes/fellas-babershop-ssr`
- Branch: `main`
- Build pack: **Nixpacks** (auto-detects Nuxt)
- Port: `3000`
- Domain: **`preview.fellasbarber.com`** for now (we'll switch to apex
  after verifying)

Build/start commands — Nixpacks auto-detects these from `package.json`:

- Install: `npm ci`
- Build: `npm run build`
- Start: `node .output/server/index.mjs`

### 6.4 Environment variables

_Environment Variables_:

| Key        | Value        |
| ---------- | ------------ |
| `NODE_ENV` | `production` |

That's it — `runtimeConfig.public.siteUrl` is baked into `nuxt.config.ts`.

### 6.5 First deploy

Add `preview.fellasbarber.com` as an A record in Cloudflare pointing at
`178.105.204.69` (proxied), then in Coolify hit **Deploy**.

Watch the build log. ~3–5 minutes for the first build (`npm ci`
downloads everything; subsequent deploys are cached).

When it goes green, visit `https://preview.fellasbarber.com`. Verify:

- Page loads, hero video plays
- Images load (look at the `<img>` `src` attributes — should be
  `/_ipx/...` URLs, _not_ `/.netlify/images?...`)
- Theme toggle works
- Language switcher works
- All 5 routes load
- Console is clean (no hydration mismatches, no 404s)

---

## Phase 7 — Cutover (only after Phase 6 is verified)

### 7.1 Lower the apex DNS TTL ahead of time

If you're already serving from Netlify on Cloudflare DNS, drop the TTL
on `@` and `www` to **Auto** (Cloudflare default ~5 min) a few hours
before cutover. Speeds up the switch.

### 7.2 Switch the apex

In Cloudflare DNS, change the `@` and `www` A records:

- Old content: Netlify's IPs (or whatever they pointed at)
- New content: `178.105.204.69` (proxied 🟠)

Visitors hitting `https://fellasbarber.com` now resolve to Cloudflare,
which fetches from your Hetzner box and caches.

### 7.3 Add the domain to the Coolify app

In Coolify _Resource → Configuration → Domains_:

- Add `fellasbarber.com` and `www.fellasbarber.com`
- Coolify will issue Let's Encrypt certs for both (takes ~30s)

### 7.4 Verify

- `https://fellasbarber.com` works, valid cert
- Lighthouse mobile still ≥ 95
- Console clean
- All routes load
- Booking links resolve to AppBarber

Test from at least one mobile network (cellular, not your wifi) — DNS
caches at the ISP level can serve old records for a bit.

### 7.5 Decommission Netlify

Wait 24–48h to make sure no stale DNS caches are still resolving to
Netlify, then in the Netlify dashboard:

- _Site settings → Domain management_ → remove `fellasbarber.com`
- _Site settings → General_ → pause or delete the site

Don't delete the Netlify site immediately — keep it for rollback (see
below).

---

## Rollback plan

If anything goes seriously wrong post-cutover:

1. Cloudflare DNS → change `@` and `www` A records back to Netlify's
   IPs (or set them as CNAMEs to your Netlify deploy URL again).
2. Within ~5 minutes, traffic is back on Netlify.

That's the whole rollback. Keep the Netlify site around for at least
two weeks before deleting.

---

## Day-to-day after migration

### Deploying

```bash
git push origin main
```

Coolify watches the branch, builds, deploys. Same flow as Netlify.

### Logs / restart / SSH

- Logs: Coolify dashboard → Resource → _Logs_ tab
- Restart: Resource → _Restart_ button
- Shell into the container: Resource → _Terminal_
- Shell into the VPS itself: `ssh hetzner-coolify`

### Adding a second project (the future fullstack app)

In Coolify: _New Project → New Resource_ — same flow as Phase 6.3.
Pick a different domain (e.g. `app.yourname.com`), Coolify routes it
via Traefik to the new container on the same VPS.

### Adding Postgres for the fullstack app

_New Resource → Database → PostgreSQL_ → one click. Coolify provides
the connection string as an env var to whichever app you link it to.

### OS-level maintenance

`unattended-upgrades` (set up in Phase 2) auto-applies security
patches. Reboot the box once a month-ish:

```bash
ssh hetzner-coolify
apt update && apt upgrade -y
reboot
```

Coolify-managed apps auto-restart when the box comes back up.

### Backups

- **Hetzner snapshots**: console → server → _Snapshots → Take Snapshot_.
  Or enable scheduled Backups (paid, ~€1/mo) when the box hosts
  important data.
- **Postgres dumps** (when the fullstack app exists): Coolify supports
  scheduled backups → push to S3-compatible storage (Backblaze B2 ≈
  pennies/month).

---

## Cost summary

|                                              | €/mo      |
| -------------------------------------------- | --------- |
| Hetzner CX22                                 | 4.51      |
| Hetzner Snapshots (optional but recommended) | ~1.00     |
| Cloudflare Free                              | 0         |
| Coolify (self-hosted, open source)           | 0         |
| **Total**                                    | **~5.50** |

This figure does **not** change as you add more projects — same box
hosts them all until you outgrow it (resize to CX32 is one click).
