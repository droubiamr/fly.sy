# fly.sy — كيف تصل إلى سوريا

An independent, unofficial, open-source answer sheet for getting into Syria: every flight, land crossing
and paperwork requirement, with the **source**, **confidence level** and **date last checked** on every line —
plus real experiences from people who actually made the trip.

Not affiliated with any government body, airline or embassy. Sells nothing, takes no commission.

## Stack

- **Next.js 16** (App Router, Server Actions) · **TypeScript** · **Tailwind CSS 4**
- **shadcn/ui** components (source-owned in `src/components/ui`, on Radix)
- **d3-geo** + **world-atlas** (Natural Earth) for the map, rendered to SVG on the server; **country-flag-icons** for flags
- **Cloudflare D1** (SQLite) for community reports, visitor analytics and admin sessions — a binding in `wrangler.jsonc`, no extra service
- Arabic-first, RTL by default, at the root of the site. English lives under `/en`. No i18n library: `src/messages/index.ts`

## Run it

```bash
npm install
cp .env.example .env.local   # optional — only the admin sign-in needs values
npx wrangler d1 migrations apply fly-sy --local   # a local database for next dev
npm run dev
```

`npm run check` runs lint, type-check, tests and a production build. That's the bar for a PR.
`npm run smoke` (after a build) starts the server and checks every sitemap URL the way a crawler would.

## URLs and search

- One URL per language: Arabic at `/…`, English at `/en/…`. Every page carries a self-canonical, `hreflang` for both
  languages and `x-default` (Arabic). Google indexes each language separately; a cookie would have hidden English.
- Every planner answer is a static page: `/from/turkiye/to/damascus`. Origins are the countries in
  `data/origins.json` (slug from the English name), destinations the airport cities. The passport is a query on the
  page (`?p=voa`, `?p=res`) that the browser applies, so it costs no request and no extra pages. Each crossing,
  airport and airline has a page too, and `/documents` holds the paperwork. All of it is prerendered from `data/` at
  build time; only `/reports` renders per request.
- On Cloudflare the prerendered pages are served from the static assets bundle (`open-next.config.ts`), so the
  Worker never renders them. `npm run deploy` populates that cache; without it every request would render the page,
  world map included, and hit the Worker CPU limit (error 1102).
- `data/meta.json → updated` feeds `lastmod` in the sitemap and `dateModified` in the structured data, so bumping it
  after a review pass is what tells search engines the site moved.
- Structured data: `WebSite`, `Organization` and a `Dataset` (the CC BY-SA data) on the home and about pages;
  `BreadcrumbList` and `WebPage` everywhere; `Airport`, `Place` and `Airline` on their pages.
- Search Console: `public/google….html` serves the HTML-file verification. Submit `https://fly.sy/sitemap.xml`.

## Where things live

| Path | What |
|---|---|
| `data/*.json` | **All sourced facts.** Editing these is how the site is updated. |
| `data/origins.json` | The countries you can start from, with the hub airport the map draws the route from. |
| `src/lib/plan.ts` | The route planner. Pure function, tested in `tests/`. |
| `src/lib/data.ts` | Loads and types the JSON. |
| `src/messages/index.ts` | UI strings, `ar` and `en`. |
| `src/app/globals.css` | Design tokens. The whole look is these variables. |
| `src/app/icon.svg` | The brand mark. `npm run icons` rebuilds the favicon, app icons and share card from it (`scripts/icons.mjs`). |
| `src/app/manifest.ts`, `robots.ts`, `sitemap.ts` | Web app manifest, robots.txt and sitemap.xml (every page, both languages, with hreflang). |
| `src/lib/site.ts` | The canonical origin (`https://fly.sy`) and the locale → URL rules. |
| `src/lib/seo.ts`, `src/lib/schema.ts` | Per-page metadata (canonical, hreflang, Open Graph) and JSON-LD builders. |
| `src/proxy.ts` | Rewrites `/` → `/ar` internally; `/en` passes through. Old `?from=&to=` links redirect to their page. |
| `scripts/smoke.mjs` | Walks the built site like a crawler: status, canonical, hreflang, JSON-LD, redirects, 404s. |
| `migrations/` | D1 schema: reports and page views (`0001`), admin sessions and the sign-in log (`0002`). |
| `src/lib/db.ts` | The D1 binding (`DB`), typed. |
| `src/lib/admin-auth.ts`, `src/lib/auth-crypto.ts`, `src/app/admin/actions.ts` | Admin sign-in: Access check, sessions, password hashing, TOTP, lockout. |
| `src/app/admin/` | The admin dashboard: traffic at `/admin`, report moderation at `/admin/reports`. Its own root layout, English. |
| `src/app/api/track/route.ts`, `src/components/visit-tracker.tsx` | Page-view tracking: the component posts each navigation, the route stores it. |
| `src/lib/analytics.ts` | Pure helpers behind tracking and the dashboard (path, source, country, ranges). Tested in `tests/`. |

## Updating data (the weekly job)

Each record in `data/` carries:

```
status:      open | caution | closed | unknown
confidence:  verified | reported | unconfirmed
source:      a key from data/sources.json (give a source a `url`, https or a site path, and its name becomes a link)
seen:        YYYY-MM-DD — bump it every time you re-check, even if nothing changed
```

Rules:
1. **Never write a fact without a `source`.** If there is none, use `nosrc` and say so in the text.
2. Tour operators and press are capped at `reported`. Only official bodies, the operator itself,
   or a checked traveller report earn `verified`.
3. Bump `seen` when you review a line. A fresh date on an unchanged fact is the signal the site is alive.
4. Update `data/meta.json` → `updated` after each review pass.
5. `npm test` checks referential integrity (every entry, road, source and airline id resolves).
6. Every airport in `entries.json` names its `city`. The destination picker lists the airports by name and routes to that city.

## Community reports

Submissions land in D1 as `pending`. Nothing is public until it is published at `/admin/reports`, where you can
also reject a report or send it back to pending. The public feed never selects the `contact` column; only the
moderation page shows it. Editor-verified seed reports in `data/reports.seed.json` keep the feed alive on a
fresh deploy.

## The database (D1)

One D1 database, `fly-sy`, bound as `DB`. Only the Worker can reach it.

```bash
npx wrangler d1 create fly-sy                          # once; paste the id into wrangler.jsonc
npx wrangler d1 migrations apply fly-sy --remote       # production
npx wrangler d1 migrations apply fly-sy --local        # the local database next dev and npm run preview use
npx wrangler d1 execute fly-sy --remote --command "select count(*) from page_views"
```

New schema changes go in a new file in `migrations/` (`npx wrangler d1 migrations create fly-sy <name>`).

## Visitor analytics

First-party only: no third-party script. Every navigation posts `{ path, referrer, utm_source }` to `/api/track`,
which writes one row to `page_views`:

- path, language, time, and the source (`utm_source`, else the referring host);
- IP address (`CF-Connecting-IP`), and Cloudflare's country, region, city and network (ASN and its name);
- the full user agent, plus device type, browser and OS parsed from it;
- `fsy_vid`: a random UUID in an httpOnly first-party cookie (400 days) that recognises returning browsers.
  Browsers that send Global Privacy Control get no cookie; their views are still recorded.

Bots, headless browsers and your own visits while signed in to `/admin` are not recorded. The dashboard at
`/admin` shows it all for 24 hours to 90 days; click an IP or a visitor id to narrow every figure to it.
Nothing is deleted automatically: to keep 13 months, run
`delete from page_views where ts < (unixepoch('now', '-13 months') * 1000)` from a scheduled job.

## Admin sign-in

`/admin` is protected in layers, each built on a maintained, documented component rather than custom crypto:

| Layer | What it does |
|---|---|
| [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/self-hosted-public-app/) | Nobody reaches `/admin` without logging in to Access first (email one-time PIN, Google, GitHub, passkeys…). The app also verifies the Access JWT on every admin request with `jose`. |
| [Turnstile](https://developers.cloudflare.com/turnstile/) | Bots are stopped before the password is looked at; the token is verified server-side, with host and action. |
| Rate limit + lockout | Workers Rate Limiting binding: 5 tries a minute per IP. D1: 5 failures per IP, or 20 in total, within 15 minutes locks the form. |
| Password | PBKDF2-SHA256, 100,000 iterations (the most Workers allow), random salt; breached passwords are refused at setup. Or, with no terminal, the password itself as the `ADMIN_PASSWORD` secret (Cloudflare secrets are write-only). |
| Authenticator code | TOTP (RFC 6238) via `otpauth`. Each code is accepted once. |
| Session | 256-bit random token in a `__Host-` cookie (Secure, HttpOnly, SameSite=Strict); only its SHA-256 is stored. 30 minutes idle, 8 hours absolute. See and revoke sessions at `/admin/security`. |
| Page | Strict per-request nonce CSP, `frame-ancestors 'none'`, `no-store`, `noindex`. Every failure shows the same message; the reason goes to the sign-in log. |

Set up:

1. `npm run admin:setup`: type a password (12+ characters). It prints `ADMIN_PASSWORD_HASH` and
   `ADMIN_TOTP_SECRET` with an `otpauth://` link; add that to your authenticator app.
2. Cloudflare dashboard → Turnstile → add a widget for `fly.sy` → site key and secret key.
3. Store all four as secrets (or in the dashboard: Workers & Pages → fly-sy → Settings → Variables and Secrets;
   without a terminal, use `ADMIN_PASSWORD` with the password itself instead of the hash):
   `npx wrangler secret put ADMIN_PASSWORD_HASH` (and `ADMIN_TOTP_SECRET`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`).
4. Cloudflare Access (free up to 50 users): Zero Trust → Access → Applications → Add → Self-hosted. Domain
   `fly.sy`, path `admin*` (a path of `admin/*` would leave `/admin` itself open). Policy: Allow, your email.
   Copy the application's AUD tag, then `npx wrangler secret put CF_ACCESS_TEAM_DOMAIN`
   (`https://<team>.cloudflareaccess.com`) and `npx wrangler secret put CF_ACCESS_AUD`.
5. Deploy and sign in at `/admin`. `/admin/security` shows which layers are on.

For local development put the same four values in `.env.local`, using Cloudflare's Turnstile testing pair
(`1x00000000000000000000AA` / `1x0000000000000000000000000000000AA`); leave the Access pair empty.

## Design

Direction "Passport": cool grey ground, passport-green accent, outlined *stamp* chips for status,
Readex Pro. Tokens are in `globals.css`; every component reads them, so restyling is one file.

The brand mark is `src/app/icon.svg`: Syria's border from Natural Earth (public domain), in white on a passport-green tile. Everything raster
(`favicon.ico`, `apple-icon.png`, the manifest icons in `public/`, `opengraph-image.png`) is generated from it
by `npm run icons` and committed. The share card sets its text in Readex Pro, so install the font locally
before regenerating it.

## Licence

Code: [MIT](LICENSE). Data (`data/`): [CC BY-SA 4.0](data/LICENSE).
Map geometry is [Natural Earth](https://www.naturalearthdata.com/) (public domain) via `world-atlas` (ISC); flags are
from `country-flag-icons` (MIT).
