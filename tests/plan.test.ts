import { test } from "node:test"
import assert from "node:assert/strict"
import { airportReach, answerFor, groupWays, plan } from "../src/lib/plan.ts"
import type { Arrival, Entry, OriginDef, Roads } from "../src/lib/types.ts"

const entries: Record<string, Entry> = {
  DAM: { kind: "air", name: { ar: "دمشق", en: "Damascus" }, lat: 0, lng: 0, status: "open", source: "gaca", seen: "2026-09-20" },
  BAB: { kind: "land", name: { ar: "باب الهوى", en: "Bab al-Hawa" }, lat: 0, lng: 0, status: "open", source: "ports", seen: "2026-09-20", syriansOnly: true },
}
const base = { city: { ar: "x", en: "x" }, country: "TR", from: "TR", status: "open" as const, confidence: "reported" as const, source: "press", seen: "2026-09-20" }
const arrivals: Arrival[] = [
  { ...base, airline: "TK", entry: "DAM", mode: "air", hours: 2 },
  { ...base, airline: null, entry: "BAB", mode: "land", hours: 3 },
  { ...base, airline: null, entry: "DAM", mode: "air", hours: 1, from: "LB" },
  { ...base, airline: null, entry: "DAM", mode: "air", hours: 8, from: "eu" },
  { ...base, airline: "RB", entry: "DAM", mode: "air", hours: 3, hidden: true },
]
const roads: Roads = { DAM: { idlib: 5, damascus: 0.5 }, BAB: { idlib: 0.5 } }
const TR = { id: "TR" }

test("filters by origin and drops hidden rows", () => {
  const r = plan({ arrivals, entries, roads, from: TR, dest: "damascus", passport: "sy" })
  assert.equal(r.length, 2)
  assert.ok(r.every((j) => j.from === "TR" && !j.hidden))
})

test("a country in a group also gets the group's arrivals", () => {
  const de = plan({ arrivals, entries, roads, from: { id: "DE", group: "eu" }, dest: "damascus", passport: "sy" })
  assert.deepEqual(de.map((j) => j.from), ["eu"])
  const lb = plan({ arrivals, entries, roads, from: { id: "LB" }, dest: "damascus", passport: "sy" })
  assert.deepEqual(lb.map((j) => j.from), ["LB"])
})

test("sorts by total hours, blocked last", () => {
  const sy = plan({ arrivals, entries, roads, from: TR, dest: "idlib", passport: "sy" })
  assert.equal(sy[0].entry, "BAB")
  assert.equal(sy[0].totalHours, 3.5)
  assert.equal(sy[0].blocked, false)

  const voa = plan({ arrivals, entries, roads, from: TR, dest: "idlib", passport: "voa" })
  assert.equal(voa[0].entry, "DAM")
  assert.equal(voa.at(-1)?.blocked, true)
})

test("a closed route sorts after the ones that run, blocked ones last", () => {
  const withClosed: Arrival[] = [...arrivals, { ...base, airline: "EK", entry: "DAM", mode: "air", hours: 0.5, status: "closed" }]
  const sy = plan({ arrivals: withClosed, entries, roads, from: TR, dest: "damascus", passport: "sy" })
  assert.equal(sy[0].airline, "TK")
  assert.equal(sy.at(-1)?.status, "closed")

  const voa = plan({ arrivals: withClosed, entries, roads, from: TR, dest: "idlib", passport: "voa" })
  assert.deepEqual(
    voa.map((j) => [j.status, j.blocked]),
    [["open", false], ["closed", false], ["open", true]],
  )
})

test("unknown road time yields null total and sorts after known", () => {
  const r = plan({ arrivals, entries, roads, from: TR, dest: "qamishli", passport: "sy" })
  assert.ok(r.every((j) => j.totalHours === null))
})

test("airportReach: direct from here, via when only others fly there, none when closed or blocked", () => {
  const es: Record<string, Entry> = {
    ...entries,
    ALP: { ...entries.DAM, name: { ar: "حلب", en: "Aleppo" } },
    LTK: { ...entries.DAM, status: "closed" },
    KAC: { ...entries.DAM, syriansOnly: true },
    NOF: { ...entries.DAM },
  }
  const as: Arrival[] = [
    ...arrivals,
    { ...base, airline: null, entry: "ALP", mode: "air", hours: 1, from: "LB" },
    { ...base, airline: null, entry: "KAC", mode: "air", hours: 2 },
  ]
  const sy = airportReach({ arrivals: as, entries: es, from: TR, passport: "sy" })
  assert.deepEqual(sy, { DAM: "direct", ALP: "via", LTK: "none", KAC: "direct", NOF: "none" })
  const voa = airportReach({ arrivals: as, entries: es, from: TR, passport: "voa" })
  assert.equal(voa.KAC, "none")
  const de = airportReach({ arrivals: as, entries: es, from: { id: "DE", group: "eu" }, passport: "sy" })
  assert.equal(de.DAM, "direct")
  assert.equal(de.ALP, "via")
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
  for (const [id, e] of Object.entries(DATA.entries as Record<string, { kind: string; city?: string }>))
    if (e.kind === "air") assert.ok(e.city && cityIds.has(e.city), `airport ${id} must name its city`)
  for (const a of DATA.arrivals) if (a.airline) assert.ok(DATA.airlines[a.airline], `airline ${a.airline}`)
  for (const [id, s] of Object.entries(DATA.sources as Record<string, { url?: string }>))
    if (s.url) assert.match(s.url, /^(https:\/\/|\/)/, `source ${id} url must be https or a site path`)
})

test("real data: every origin is a country on the map and has at least one route; every arrival origin resolves", async () => {
  const { readFileSync } = await import("node:fs")
  const load = (f: string) => JSON.parse(readFileSync(new URL(`../data/${f}.json`, import.meta.url), "utf8"))
  const origins = load("origins") as OriginDef[]
  const arrivals = load("arrivals") as Arrival[]
  const atlas = JSON.parse(readFileSync(new URL("../node_modules/world-atlas/countries-110m.json", import.meta.url), "utf8"))
  const m49s = new Set<string>(atlas.objects.countries.geometries.map((g: { id: string }) => g.id))
  const ids = new Set(origins.map((o) => o.id))
  assert.equal(ids.size, origins.length, "duplicate origin id")
  for (const o of origins) {
    assert.match(o.id, /^[A-Z]{2}$/, `origin id ${o.id} is not an ISO alpha-2 code`)
    assert.ok(m49s.has(o.m49), `origin ${o.id}: m49 ${o.m49} is not in the atlas`)
    assert.ok(o.hub[0] >= -180 && o.hub[0] <= 180 && o.hub[1] >= -90 && o.hub[1] <= 90, `origin ${o.id}: hub is [lng, lat]`)
    const routes = plan({ arrivals, entries: load("entries"), roads: load("roads"), from: o, dest: "damascus", passport: "sy" })
    assert.ok(routes.length > 0, `origin ${o.id} has no routes; it would be an empty choice`)
  }
  const groups = new Set(origins.map((o) => o.group).filter(Boolean))
  for (const a of arrivals) assert.ok(ids.has(a.from) || groups.has(a.from), `arrival from ${a.from} matches no origin or group`)
})

test("answerFor names the fastest running route, never an unknown or blocked one", () => {
  const more: Arrival[] = [
    ...arrivals,
    { ...base, airline: "PC", entry: "DAM", mode: "air", hours: 0.5, status: "unknown" },
    { ...base, airline: "XQ", entry: "DAM", mode: "air", hours: 0.2, status: "closed" },
  ]
  const sy = answerFor(plan({ arrivals: more, entries, roads, from: TR, dest: "idlib", passport: "sy" }))
  assert.equal(sy.best?.entry, "BAB", "fastest open route; the quicker unknown and closed ones are skipped")
  assert.deepEqual([sy.running, sy.total], [2, 4])

  const voa = answerFor(plan({ arrivals: more, entries, roads, from: TR, dest: "idlib", passport: "voa" }))
  assert.equal(voa.best?.airline, "TK", "Bab al-Hawa is closed to this passport")
  assert.deepEqual([voa.running, voa.total], [1, 3], "a blocked route is not counted as known for this passport")
})

test("answerFor falls back to a conditional route, then to none", () => {
  const caution: Arrival[] = [{ ...base, airline: "TK", entry: "DAM", mode: "air", hours: 2, status: "caution" }]
  const a = answerFor(plan({ arrivals: caution, entries, roads, from: TR, dest: "damascus", passport: "sy" }))
  assert.equal(a.best?.status, "caution")
  const closed: Arrival[] = [{ ...base, airline: "TK", entry: "DAM", mode: "air", hours: 2, status: "closed" }]
  const none = answerFor(plan({ arrivals: closed, entries, roads, from: TR, dest: "damascus", passport: "sy" }))
  assert.equal(none.best, null)
  assert.deepEqual([none.running, none.total], [0, 1])
})

test("groupWays: one way per entry, fastest first, with the drive and status it needs", () => {
  const es: Record<string, Entry> = { ...entries, DAM: { ...entries.DAM, city: "damascus" }, ALP: { ...entries.DAM, name: { ar: "حلب", en: "Aleppo" }, city: "aleppo" } }
  const rs: Roads = { ...roads, ALP: { damascus: 4.5 } }
  const as: Arrival[] = [
    { ...base, airline: "TK", entry: "DAM", mode: "air", hours: 2 },
    { ...base, airline: "PC", entry: "DAM", mode: "air", hours: 1, status: "unknown" },
    { ...base, airline: "XQ", entry: "ALP", mode: "air", hours: 1.5 },
    { ...base, airline: null, entry: "BAB", mode: "land", hours: 3 },
  ]
  const ways = groupWays(plan({ arrivals: as, entries: es, roads: rs, from: TR, dest: "damascus", passport: "sy" }), "damascus")
  assert.deepEqual(ways.map((w) => w.entry), ["DAM", "ALP", "BAB"], "fastest first; a way with no road time to the city comes last")
  assert.equal(ways[2].best, null, "no time, so no answer from it")
  const dam = ways[0]
  assert.equal(dam.journeys.length, 2)
  assert.equal(dam.best?.airline, "TK", "the faster unknown flight is listed but not the answer")
  assert.equal(dam.status, "open")
  assert.equal(dam.drive, false, "the airport is in the destination city")
  assert.equal(ways[1].drive, true, "Aleppo airport, then the road to Damascus")
})

test("groupWays: a crossing closed to a passport is a blocked way", () => {
  const ways = groupWays(plan({ arrivals, entries, roads, from: TR, dest: "idlib", passport: "voa" }), "idlib")
  const bab = ways.find((w) => w.entry === "BAB")!
  assert.equal(bab.blocked, true)
  assert.equal(bab.mode, "land")
  assert.equal(bab.drive, true)
  assert.equal(ways.at(-1)?.entry, "BAB", "blocked ways come last")
  assert.equal(bab.fly, false, "Türkiye to Bab al-Hawa is a drive")
})

test("groupWays: a crossing reached from another country starts with a flight", () => {
  const es: Record<string, Entry> = { ...entries, JDE: { ...entries.BAB, syriansOnly: false, country: "LB", name: { ar: "جديدة يابوس", en: "Jdeidet Yabous" } } }
  const rs: Roads = { JDE: { damascus: 1 } }
  const as: Arrival[] = [
    { ...base, airline: null, entry: "JDE", mode: "land", hours: 8, from: "eu", country: "LB", city: { ar: "بيروت", en: "Beirut, then overland" } },
    { ...base, airline: null, entry: "JDE", mode: "land", hours: 1, from: "LB", country: "LB" },
  ]
  const de = groupWays(plan({ arrivals: as, entries: es, roads: rs, from: { id: "DE", group: "eu" }, dest: "damascus", passport: "sy" }), "damascus")
  assert.deepEqual([de[0].fly, de[0].drive], [true, true], "Germany: fly to Beirut, then cross")
  const lb = groupWays(plan({ arrivals: as, entries: es, roads: rs, from: { id: "LB" }, dest: "damascus", passport: "sy" }), "damascus")
  assert.deepEqual([lb[0].fly, lb[0].drive], [false, true], "Lebanon: drive only")
})
