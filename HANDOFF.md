# fly.sy — handoff

Start here, then README.md and CONTRIBUTING.md.

## What it is

**fly.sy** is a public, open-source, independent site answering one question: *how do I get into Syria, today?* Flights, land crossings, and the paperwork you need — for Syrians and for foreign visitors — with the **source, confidence level and date last checked on every single line**. Built around **real experiences from people who made the trip**, not only data the owner sources.

- Owner: Amr (GitHub: `droubiamr`, repo `droubiamr/fly.sy`). Trilingual AR/EN/DE.
- Audience: Syrian diaspora (Germany, Türkiye, Gulf, Lebanon, Jordan) and foreign travellers.
- **Not** for travel agencies. **Not** official. No government affiliation, sells nothing, takes no commission.
- Arabic-first (RTL default) at `/`, English at `/en`. German is a planned third language (add it to `LOCALES` in
  `src/lib/site.ts`, `messages`, and the `languages` maps in `src/lib/seo.ts` and `src/app/sitemap.ts`).

## Decisions already made (don't reopen without asking)

| Decision | Choice |
|---|---|
| Audience | Public / consumers, not agencies |
| Licence | Code MIT, data CC BY-SA 4.0 |
| UI direction | **B — "Passport"**: calm, light, cool-grey ground, passport-green `#0E5C3F` accent, outlined *stamp* chips for status, Readex Pro font |
| Style rules | Icon-first, minimal text. Mobile-first. No gradients, shadows, emoji, left-border cards. 44px touch targets. Pre-built components, not hand-rolled |
| Stack | Next.js 16 (App Router, Server Actions), TypeScript, Tailwind 4, shadcn/ui (Radix), lucide-react |
| Community reports | Supabase (Postgres + RLS) with a moderation queue |
| Honesty model | Every fact has `source` + `confidence` + `seen`. Where there's no source, say so (`nosrc`) — never guess |

## What we won't publish without a dated official source

Restricted-nationality lists, military-service rules, effects on asylum/residence status in a specific country, expired-passport procedures for Syrians abroad. These show as declared gaps.

## Repo structure

```
data/*.json            all sourced facts (the weekly edit)
  sources.json         source registry (gaca, ports, sana, easa, airline, press, ops, gov, trav, est, nosrc)
  airlines.json        carriers by IATA code
  entries.json         airports + land crossings (status, source, seen, note)
  arrivals.json        routes into Syria: airline, origin city, entry, hours, status, confidence
  origins.json         countries you can start from: ISO code, names, atlas id, hub airport, region
  roads.json           estimated road hours entry → city
  needs.json           documents by mode (air/land) × passport (sy/voa/res)
  cities.json, meta.json, reports.seed.json
src/lib/plan.ts        pure planner: ranks journeys by total time, blocks Türkiye crossings for non-Syrians;
                       an arrival filed under a group ("eu") applies to every country in that group
src/lib/data.ts        typed JSON loader
src/messages/index.ts  all UI strings, ar + en
src/app/globals.css    design tokens — the whole look
src/app/[lang]/(site)/ routes: / (plan), /from/[origin]/to/[city] (?p=passport), /airlines, /airlines/[slug],
                       /crossings, /crossings/[slug], /airports/[slug], /documents, /reports, /reports/new, /about
src/app/               sitemap.ts, robots.ts, manifest.ts, icons; src/proxy.ts maps / → /ar internally
src/components/        app-shell, bottom-nav, disclaimer (no-liability popup, once per browser), planner, world-map, flag,
                       route-card, status-stamp, provenance, report-form, ui/ (shadcn)
supabase/migrations/0001_reports.sql   reports table, RLS, public view without contact field
tests/plan.test.ts     planner + data integrity tests
```

Planner state lives in the URL (`/?from=DE&to=homs&p=sy`) so every answer is shareable. `from` is an ISO country
code; the old region ids (`eu`, `gulf`, `tr`…) still resolve so shared links keep working.

## The map

`world-map.tsx` is a server component: Natural Earth coastlines from the `world-atlas` package (public domain data),
projected with `d3-geo` (Equal Earth), rendered to SVG on the server. The phone gets ~30KB of SVG and no map script,
no tiles, no third-party requests. The frame fits the chosen country's hub airport and Syria; the 50m atlas is used
close in and the 110m one for Europe-sized frames. Flags are inline SVG from `country-flag-icons` (MIT), imported one
by one in `flag.tsx` so only the origins' flags ship.
Airline logos are static PNGs in `public/airlines/` (light and `dark/` variants, see the README there), rendered by
`airline-logo.tsx`.

**Adding an origin country:** one line in `data/origins.json` (`m49` is the UN numeric code the atlas uses, `hub` is
`[lng, lat]` of the main airport), its flag in `flag.tsx`, and at least one arrival row (or a `group` it belongs to).
`npm test` checks all three.

Scripts: `npm run dev`, `npm test`, `npm run check` (lint + types + tests + build — the bar for any change).

## Current state

- Built, lint-clean, type-clean, 6 tests passing, production build passes, all routes return 200 on the built server.
- **Not yet verified:** in a real browser on a phone, and the Supabase insert end to end.
- Seeded data is from news reporting and travel operators as of Sep 2026 — mostly `reported`, not `verified`. Road times are estimates. **All of it needs re-verifying by Amr** before launch.
- 23 Sep 2026 airline pass: 22 carriers and 5 airports (Deir ez-Zor open; Latakia and Qamishli closed). Every air route was checked against the official airport flight boards (damairport.gov.sy, alpairport.gov.sy) and against Flightradar24 / FlightAware tracking of flights actually flown in September 2026; rows confirmed that way are `verified` with source `damairport`, `alpairport` or `tracker`, and carry the flight number and days in the note. Routes that were announced but never showed up on a board or in tracking are `unknown`/`unconfirmed` with the reason in the note.
- Egypt stays a declared gap: no airline flies Cairo–Damascus, so the Egypt origin carries one honest 'connect via' row.
- Contact address is `info@fly.sy` (`contact` in `data/meta.json`); it is set up and receiving mail.

## Immediate next step — get it onto GitHub

The first commit failed because `git add` wasn't run. There's also a stray `Untitled/` folder in the project — check what it is and delete it if it isn't needed. Then from the project folder:

```bash
rm -rf Untitled          # only if it's junk
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/droubiamr/fly.sy.git   # skip if it says "already exists"
git push -u origin main
```

If the push is rejected because the GitHub repo already has a README:

```bash
git pull origin main --allow-unrelated-histories   # keep our versions of any conflicts
git push -u origin main
```

Then: `npm install`, `npm run check`, `npm run dev`, open on phone.

## Backlog, in order

1. Verify on a real phone; fix anything at 390px width.
2. Supabase: create project, run the migration, add `.env.local`, test a submission end to end.
3. GitHub Actions running `npm run check` on every PR.
4. Share button on each route card (copies the URL).
5. `/admin` moderation page behind Supabase Auth (needs a decision on how Amr signs in).
6. Airlines tab: filter by arrival airport (Damascus / Aleppo); weekly frequency per route.
7. German (`de`) as a third locale.
8. Re-verify every seeded data row.

## Open decisions for Amr

- Whether to name himself publicly on the site or stay behind a studio name + contact channel.
- Monetization: if affiliate links are ever added, the "no commission" line in the independence notice must change.
- Auth method for the admin page.
