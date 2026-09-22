# Contributing

## Correcting a fact
Open a PR that edits the relevant file in `data/`. In the PR description say **where the correction
comes from** (a link, a document, or "I crossed on this date"). Bump the record's `seen` date. If the
source is you, set `confidence: reported` — a maintainer upgrades to `verified` after a second confirmation.

## Adding a route or crossing
- Airlines: add the carrier to `data/airlines.json`, then one row per origin city in `data/arrivals.json`.
- Crossings: add to `data/entries.json` with `kind: "land"`, then its road times to every city in
  `data/roads.json` (road legs are automatically labelled `source: est`).

## Code
`npm run check` must pass. Reuse `src/components/ui` (shadcn) and the shared components; don't add
a second button, card or status chip. New logic gets a test in `tests/`.

## What we won't publish
Lists of restricted nationalities, military-service rules, or anything about asylum status in a
specific country — unless it comes with a dated, published official source. A declared gap beats a guess.
