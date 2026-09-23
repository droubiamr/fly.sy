# Contributing

## Correcting a fact
Open a PR that edits the relevant file in `data/`. In the PR description say **where the correction
comes from** (a link, a document, or "I crossed on this date"). Bump the record's `seen` date. If the
source is you, set `confidence: reported` — a maintainer upgrades to `verified` after a second confirmation.

## Adding a route or crossing
- Airlines: add the carrier to `data/airlines.json`, then one row per origin city in `data/arrivals.json`. Drop its logo in `public/airlines/{CODE}.png` and `public/airlines/dark/{CODE}.png` (70×70, transparent).
  `from` is the ISO country code of an entry in `data/origins.json`, or a group such as `eu` that applies to
  every country in it.
- Countries: add one line to `data/origins.json` and its flag to `src/components/flag.tsx`. A country needs at
  least one arrival row, otherwise it is an empty choice and `npm test` fails.
- Crossings: add to `data/entries.json` with `kind: "land"`, then its road times to every city in
  `data/roads.json` (road legs are automatically labelled `source: est`).

## Code
`npm run check` must pass. Reuse `src/components/ui` (shadcn) and the shared components; don't add
a second button, card or status chip. New logic gets a test in `tests/`.

The site is RTL first. Use logical Tailwind classes (`ps-`/`pe-`, `ms-`/`me-`, `start-`/`end-`,
`text-start`), never `pl-`/`pr-`/`left-`/`right-`; flip directional icons with `rtl:rotate-180` and
put a "→" between places through `arrow(locale)` in `src/lib/format.ts`. Radix primitives read the
direction from the `Direction.Provider` in `messages-provider.tsx`, not from the document, so keep
new ones inside it. Nothing may be wider than the screen: a phone widens its layout viewport to fit
an overflowing element and the whole page starts panning sideways.

## What we won't publish
Lists of restricted nationalities, military-service rules, or anything about asylum status in a
specific country — unless it comes with a dated, published official source. A declared gap beats a guess.
