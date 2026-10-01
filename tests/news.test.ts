import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

// Reads the JSON directly and imports nothing from src, so the sweep Routine can run it
// on a fresh clone without npm install: node --experimental-strip-types --test tests/news.test.ts
const load = (name: string) => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), "utf8"))

type Item = {
  id: string
  date: string
  title: Record<string, string>
  text: Record<string, string>
  source: string
  url?: string
  entries?: string[]
  airlines?: string[]
}

test("news: every item is dated, bilingual, sourced, and links to things that exist", () => {
  const news = load("news") as Item[]
  const sources = load("sources")
  const entries = load("entries")
  const airlines = load("airlines")
  const ids = new Set<string>()
  for (const n of news) {
    assert.ok(!ids.has(n.id), `duplicate id ${n.id}`)
    ids.add(n.id)
    assert.match(n.date, /^\d{4}-\d{2}-\d{2}$/, `${n.id} date`)
    assert.ok(!Number.isNaN(Date.parse(n.date)), `${n.id} date`)
    for (const lang of ["ar", "en"]) {
      assert.ok(n.title?.[lang]?.trim(), `${n.id} title.${lang}`)
      assert.ok(n.text?.[lang]?.trim(), `${n.id} text.${lang}`)
    }
    assert.ok(sources[n.source], `${n.id} source ${n.source}`)
    assert.notEqual(n.source, "nosrc", `${n.id} has no source`)
    if (n.url) assert.match(n.url, /^https:\/\//, `${n.id} url`)
    for (const e of n.entries ?? []) assert.ok(entries[e], `${n.id} entry ${e}`)
    for (const a of n.airlines ?? []) assert.ok(airlines[a], `${n.id} airline ${a}`)
  }
})

test("news: the file lists the newest first", () => {
  const dates = (load("news") as Item[]).map((n) => n.date)
  assert.deepEqual(dates, [...dates].sort().reverse())
})
