import { test } from "node:test"
import assert from "node:assert/strict"
import { arrivalsThrough, entriesOfKind, entryHref, roadsFrom } from "../src/lib/entries.ts"
import type { Arrival, City, Entry, Roads } from "../src/lib/types.ts"

const entries: Record<string, Entry> = {
  DAM: { kind: "air", name: { ar: "دمشق", en: "Damascus" }, lat: 0, lng: 0, status: "open", source: "gaca", seen: "2026-09-20" },
  JDE: { kind: "land", name: { ar: "جديدة", en: "Jdeidet" }, lat: 0, lng: 0, status: "open", source: "ports", seen: "2026-09-20" },
}
const base = { city: { ar: "x", en: "x" }, country: "TR", from: "tr" as const, status: "open" as const, confidence: "reported" as const, source: "press", seen: "2026-09-20", hours: 1 }
const arrivals: Arrival[] = [
  { ...base, airline: "TK", entry: "DAM", mode: "air" },
  { ...base, airline: "RB", entry: "DAM", mode: "air", hidden: true },
  { ...base, airline: null, entry: "JDE", mode: "land" },
]
const cities: City[] = [
  { id: "damascus", name: { ar: "دمشق", en: "Damascus" }, lat: 0, lng: 0 },
  { id: "aleppo", name: { ar: "حلب", en: "Aleppo" }, lat: 0, lng: 0 },
  { id: "qamishli", name: { ar: "القامشلي", en: "Qamishli" }, lat: 0, lng: 0 },
]
const roads: Roads = { DAM: { aleppo: 5, damascus: 0.5 } }

test("entriesOfKind splits airports from crossings in data order", () => {
  assert.deepEqual(entriesOfKind(entries, "air").map(([id]) => id), ["DAM"])
  assert.deepEqual(entriesOfKind(entries, "land").map(([id]) => id), ["JDE"])
})

test("arrivalsThrough keeps only public rows for that entry", () => {
  assert.deepEqual(arrivalsThrough(arrivals, "DAM").map((a) => a.airline), ["TK"])
  assert.equal(arrivalsThrough(arrivals, "ALP").length, 0)
})

test("roadsFrom sorts nearest first and drops cities without an estimate", () => {
  assert.deepEqual(roadsFrom(roads, cities, "DAM").map((r) => [r.city.id, r.hours]), [["damascus", 0.5], ["aleppo", 5]])
  assert.deepEqual(roadsFrom(roads, cities, "JDE"), [])
})

test("entryHref sends each kind to its own section", () => {
  assert.equal(entryHref("DAM", entries.DAM), "/flights/DAM")
  assert.equal(entryHref("JDE", entries.JDE), "/crossings/JDE")
})
