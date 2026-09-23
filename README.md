# fly.sy — كيف تصل إلى سوريا

An independent, unofficial, open-source answer sheet for getting into Syria: every flight, land crossing
and paperwork requirement, with the **source**, **confidence level** and **date last checked** on every line —
plus real experiences from people who actually made the trip.

Not affiliated with any government body, airline or embassy. Sells nothing, takes no commission.

## Stack

- **Next.js 16** (App Router, Server Actions) · **TypeScript** · **Tailwind CSS 4**
- **shadcn/ui** components (source-owned in `src/components/ui`, on Radix)
- **Supabase** (Postgres + RLS) for community reports — optional; the site runs without it
- Arabic-first, RTL by default, English via a cookie toggle. No i18n library: `src/messages/index.ts`

## Run it

```bash
npm install
cp .env.example .env.local   # optional — leave empty to run without Supabase
npm run dev
```

`npm run check` runs lint, type-check, tests and a production build. That's the bar for a PR.

## Where things live

| Path | What |
|---|---|
| `data/*.json` | **All sourced facts.** Editing these is how the site is updated. |
| `src/lib/plan.ts` | The route planner. Pure function, tested in `tests/`. |
| `src/lib/data.ts` | Loads and types the JSON. |
| `src/messages/index.ts` | UI strings, `ar` and `en`. |
| `src/app/globals.css` | Design tokens. The whole look is these variables. |
| `src/lib/nav.ts` | The site's sections, in order. Feeds the header nav, the mobile dock and the sitemap. |
| `src/lib/entries.ts` | Helpers behind the per-entry-point pages (arrivals through, roads from). Tested. |
| `supabase/migrations/` | Reports table, RLS and the public view. |

## Site structure

Modelled on how the good destination guides do it: a route planner up front (Rome2rio-style), one page
per border crossing and airport with dated traveller reports on it (Caravanistan-style), and a
passport-first papers page (Sherpa-style).

| Route | What |
|---|---|
| `/` | Plan: the fill-in sentence (origin · passport · destination), the map, ranked routes, entry-point status today, latest experiences. State lives in the URL. |
| `/flights` | Airports and their status, routes into each one, an airline directory. Also `/flights/DAM`, `/flights/ALP`. |
| `/crossings` | Every land crossing with status and note. Also `/crossings/JDE` etc. |
| `/flights/[id]`, `/crossings/[id]` | One entry point: status, who arrives through it, road hours to every city, what you need per passport, experiences there. |
| `/visa` | Papers by passport (`?p=sy|voa|res`) and by mode, plus the declared gaps. |
| `/reports`, `/reports/new` | Community reports, filterable by entry point (`?entry=`); the form prefills from `?entry=`. |
| `/about` | Confidence levels, source registry, open-source notice. |

Navigation: five sections in the header from tablet width up and in a floating dock on phones. About lives in
the header and the footer. `/airlines` redirects to `/flights`.

## Updating data (the weekly job)

Each record in `data/` carries:

```
status:      open | caution | closed | unknown
confidence:  verified | reported | unconfirmed
source:      a key from data/sources.json
seen:        YYYY-MM-DD — bump it every time you re-check, even if nothing changed
```

Rules:
1. **Never write a fact without a `source`.** If there is none, use `nosrc` and say so in the text.
2. Tour operators and press are capped at `reported`. Only official bodies, the operator itself,
   or a checked traveller report earn `verified`.
3. Bump `seen` when you review a line. A fresh date on an unchanged fact is the signal the site is alive.
4. Update `data/meta.json` → `updated` after each review pass.
5. `npm test` checks referential integrity (every entry, road, source and airline id resolves).

## Community reports

Submissions land in Supabase as `pending`. Nothing is public until someone with the service role sets
`status = 'published'`. The `contact` column is never exposed — the public view omits it.
Editor-verified seed reports in `data/reports.seed.json` keep the feed alive on a fresh deploy.

Set up: create a Supabase project, run `supabase/migrations/0001_reports.sql` in the SQL editor,
paste the URL and anon key into `.env.local`.

## Design

Direction "Passport": cool grey ground, passport-green accent, outlined *stamp* chips for status,
Readex Pro. Tokens are in `globals.css`; every component reads them, so restyling is one file.

## Licence

Code: [MIT](LICENSE). Data (`data/`): [CC BY-SA 4.0](data/LICENSE).
