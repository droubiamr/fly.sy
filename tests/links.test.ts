import { test } from "node:test"
import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"

// Reads the JSON directly and imports nothing from src, so the sweep Routine can run it
// on a fresh clone without npm install: node --experimental-strip-types --test tests/links.test.ts
const load = (name: string) => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), "utf8"))

type Text = Record<string, string>
type Link = { kind: string; url: string | Text; label?: Text }
type Card = {
  id: string
  group: string
  name: Text
  use: Text
  links: Link[]
  seen: string
  via?: string
  source?: string
  entry?: string
  airline?: string
  country?: string
  logo?: string
  status?: string
}

const GROUPS = ["aviation", "airlines", "consular", "visas", "borders", "tracking"]
const KINDS = ["site", "page", "telegram", "facebook", "instagram", "x", "youtube", "whatsapp", "ios", "android"]
// Everything but a website and its pages is an account or an app, which must be shown to be the body's own.
const ACCOUNT = (kind: string) => kind !== "site" && kind !== "page"
const urls = (l: Link) => (typeof l.url === "string" ? [l.url] : [l.url.ar, l.url.en])
// t.me/s/X is the web preview of t.me/X; one channel either way.
const same = (u: string) => u.replace(/^https:\/\/(www\.)?/, "").replace("t.me/s/", "t.me/").replace(/\/$/, "").toLowerCase()

test("links: every card is bilingual, dated, in a known section, and its addresses are https", () => {
  const cards = load("links") as Card[]
  const reviewed = (load("meta") as { updated: string }).updated.slice(0, 10)
  const ids = new Set<string>()
  const seen = new Map<string, string>()
  for (const c of cards) {
    assert.match(c.id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${c.id}: id is the card's anchor`)
    assert.ok(!ids.has(c.id), `duplicate id ${c.id}`)
    ids.add(c.id)
    assert.ok(GROUPS.includes(c.group), `${c.id}: group ${c.group}`)
    for (const lang of ["ar", "en"]) {
      assert.ok(c.name?.[lang]?.trim(), `${c.id} name.${lang}`)
      assert.ok(c.use?.[lang]?.trim(), `${c.id} use.${lang}`)
    }
    // Checked on a real day, and no later than the review pass it belongs to (meta.json → updated).
    assert.match(c.seen, /^\d{4}-\d{2}-\d{2}$/, `${c.id} seen`)
    assert.ok(!Number.isNaN(Date.parse(c.seen)), `${c.id} seen`)
    assert.ok(c.seen <= reviewed, `${c.id} seen ${c.seen} is after the review of ${reviewed}: bump meta.json → updated`)
    assert.ok(c.links.length > 0, `${c.id} has no links`)
    for (const l of c.links) {
      assert.ok(KINDS.includes(l.kind), `${c.id}: kind ${l.kind}`)
      if (l.kind === "page") for (const lang of ["ar", "en"]) assert.ok(l.label?.[lang]?.trim(), `${c.id}: a page link needs label.${lang}`)
      for (const u of urls(l)) {
        assert.match(u ?? "", /^https:\/\/[^\s]+$/, `${c.id}: ${u}`)
        assert.doesNotThrow(() => new URL(u), `${c.id}: ${u}`)
        // Share links carry tracking (?igsh=, ?si=, ?t=): the account itself is the address.
        if (ACCOUNT(l.kind) && l.kind !== "android") assert.ok(!u.includes("?"), `${c.id}: drop the query from ${u}`)
        const other = seen.get(same(u))
        // One address belongs to one card; the same page in both languages of one link is fine.
        assert.ok(!other || other === `${c.id}#${c.links.indexOf(l)}`, `${c.id}: ${u} is also on ${other}`)
        seen.set(same(u), `${c.id}#${c.links.indexOf(l)}`)
      }
    }
  }
})

test("links: an account is listed only when the body's own site links to it, or it is the source we cite", () => {
  const cards = load("links") as Card[]
  const sources = load("sources") as Record<string, { url?: string }>
  for (const c of cards) {
    if (c.source) assert.ok(sources[c.source], `${c.id}: source ${c.source}`)
    if (c.via) assert.match(c.via, /^https:\/\//, `${c.id}: via`)
    for (const l of c.links.filter((x) => ACCOUNT(x.kind))) {
      const cited = c.source && sources[c.source].url && urls(l).every((u) => same(u) === same(sources[c.source!].url!))
      assert.ok(c.via || cited, `${c.id}: ${l.kind} needs a "via" page on the body's own site that links to it`)
    }
  }
})

test("links: cards point at airports, carriers and countries that exist", () => {
  const cards = load("links") as Card[]
  const entries = load("entries") as Record<string, { kind: string }>
  const airlines = load("airlines") as Record<string, unknown>
  for (const c of cards) {
    if (c.entry) assert.equal(entries[c.entry]?.kind, "air", `${c.id}: entry ${c.entry} is an airport`)
    if (c.airline) assert.ok(airlines[c.airline], `${c.id}: airline ${c.airline}`)
    if (c.country) assert.match(c.country, /^[A-Z]{2}$/, `${c.id}: country`)
    if (c.logo) assert.ok(existsSync(new URL(`../public/emblems/${c.logo}.png`, import.meta.url)), `${c.id}: public/emblems/${c.logo}.png (npm run logos)`)
    if (c.status) assert.ok(["down", "building"].includes(c.status), `${c.id}: status ${c.status}`)
    // An airport's or a carrier's page shows the official website, so the card must have one.
    if (c.entry || c.airline) assert.ok(c.links.some((l) => l.kind === "site"), `${c.id}: needs a site link`)
  }
  const twice = (key: "entry" | "airline") => cards.map((c) => c[key]).filter((v, i, all) => v && all.indexOf(v) !== i)
  assert.deepEqual(twice("entry"), [], "one card per airport")
  assert.deepEqual(twice("airline"), [], "one card per carrier")
})
