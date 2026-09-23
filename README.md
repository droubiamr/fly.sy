# fly.sy — كيف تصل إلى سوريا

An independent, unofficial, open-source answer sheet for getting into Syria: every flight, land crossing
and paperwork requirement, with the **source**, **confidence level** and **date last checked** on every line —
plus real experiences from people who actually made the trip.

Not affiliated with any government body, airline or embassy. Sells nothing, takes no commission.

## Stack

- **Next.js 16** (App Router, Server Actions) · **TypeScript** · **Tailwind CSS 4**
- **shadcn/ui** components (source-owned in `src/components/ui`, on Radix)
- **d3-geo** + **world-atlas** (Natural Earth) for the map, rendered to SVG on the server; **country-flag-icons** for flags
- **Supabase** (Postgres + RLS) for community reports — optional; the site runs without it
- Arabic-first, RTL by default, at the root of the site. English lives under `/en`. No i18n library: `src/messages/index.ts`

## Run it

```bash
npm install
cp .env.example .env.local   # optional — leave empty to run without Supabase
npm run dev
```

`npm run check` runs lint, type-check, tests and a production build. That's the bar for a PR.
`npm run smoke` (after a build) starts the server and checks every sitemap URL the way a crawler would.

## URLs and search

- One URL per language: Arabic at `/…`, English at `/en/…`. Every page carries a self-canonical, `hreflang` for both
  languages and `x-default` (Arabic). Google indexes each language separately; a cookie would have hidden English.
- Every planner answer is a static page: `/from/turkiye/to/damascus`, plus `/visa-on-arrival` or `/pre-approval`
  when the passport is not Syrian. Origins are the countries in `data/origins.json` (slug from the English name),
  destinations the airport cities. Each crossing, airport and airline has a page too, and `/documents` holds the
  paperwork. All of it is prerendered from `data/` at build time; only `/reports` renders per request.
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
| `supabase/migrations/` | Reports table, RLS and the public view. |

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

Submissions land in Supabase as `pending`. Nothing is public until someone with the service role sets
`status = 'published'`. The `contact` column is never exposed — the public view omits it.
Editor-verified seed reports in `data/reports.seed.json` keep the feed alive on a fresh deploy.

Set up: create a Supabase project, run `supabase/migrations/0001_reports.sql` in the SQL editor,
paste the URL and anon key into `.env.local`.

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
