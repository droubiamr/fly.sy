import { test } from "node:test"
import assert from "node:assert/strict"
import { plan } from "../src/lib/plan.ts"
import type { Arrival, Entry, Roads } from "../src/lib/types.ts"

const entries: Record<string, Entry> = {
  DAM: { kind: "air", name: { ar: "دمشق", en: "Damascus" }, lat: 0, lng: 0, status: "open", source: "gaca", seen: "2026-09-20" },
  BAB: { kind: "land", name: { ar: "باب الهوى", en: "Bab al-Hawa" }, lat: 0, lng: 0, status: "open", source: "ports", seen: "2026-09-20", syriansOnly: true },
}
const base = { city: { ar: "x", en: "x" }, country: "TR", from: "tr" as const, status: "open" as const, confidence: "reported" as const, source: "press", seen: "2026-09-20" }
const arrivals: Arrival[] = [
  { ...base, airline: "TK", entry: "DAM", mode: "air", hours: 2 },
  { ...base, airline: null, entry: "BAB", mode: "land", hours: 3 },
  { ...base, airline: null, entry: "DAM", mode: "air", hours: 1, from: "lb" },
  { ...base, airline: "RB", entry: "DAM", mode: "air", hours: 3, hidden: true },
]
const roads: Roads = { DAM: { idlib: 5, damascus: 0.5 }, BAB: { idlib: 0.5 } }

test("filters by origin and drops hidden rows", () => {
  const r = plan({ arrivals, entries, roads, from: "tr", dest: "damascus", passport: "sy" })
  assert.equal(r.length, 2)
  assert.ok(r.every((j) => j.from === "tr" && !j.hidden))
})

test("sorts by total hours, blocked last", () => {
  const sy = plan({ arrivals, entries, roads, from: "tr", dest: "idlib", passport: "sy" })
  assert.equal(sy[0].entry, "BAB")
  assert.equal(sy[0].totalHours, 3.5)
  assert.equal(sy[0].blocked, false)

  const voa = plan({ arrivals, entries, roads, from: "tr", dest: "idlib", passport: "voa" })
  assert.equal(voa[0].entry, "DAM")
  assert.equal(voa.at(-1)?.blocked, true)
})

test("unknown road time yields null total and sorts after known", () => {
  const r = plan({ arrivals, entries, roads, from: "tr", dest: "qamishli", passport: "sy" })
  assert.ok(r.every((j) => j.totalHours === null))
})

test("real data: every arrival's entry and every road destination exist", async () => {
  const { readFileSync } = await import("node:fs")
  const load = (f: string) => JSON.parse(readFileSync(new URL(`../data/${f}.json`, import.meta.url), "utf8"))
  const DATA = { cities: load("cities"), entries: load("entries"), arrivals: load("arrivals") as Arrival[], roads: load("roads") as Roads, sources: load("sources"), airlines: load("airlines") }
  const cityIds = new Set(DATA.cities.map((c) => c.id))
  for (const a of DATA.arrivals) assert.ok(DATA.entries[a.entry], `entry ${a.entry}`)
  for (const [entry, dests] of Object.entries(DATA.roads)) {
    assert.ok(DATA.entries[entry], `road entry ${entry}`)
    for (const d of Object.keys(dests)) assert.ok(cityIds.has(d), `road dest ${d}`)
  }
  for (const a of DATA.arrivals) assert.ok(DATA.sources[a.source], `source ${a.source}`)
  for (const a of DATA.arrivals) if (a.airline) assert.ok(DATA.airlines[a.airline], `airline ${a.airline}`)
})
