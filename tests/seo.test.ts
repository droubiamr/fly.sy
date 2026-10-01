import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { localePath, splitLocale, absoluteUrl, SITE_URL } from "../src/lib/site.ts"
import { PASSPORT_SLUGS, passportFromSlug, slugify } from "../src/lib/slugs.ts"
import { fmt } from "../src/lib/text.ts"
import { getMessages } from "../src/messages/index.ts"

const load = (f: string) => JSON.parse(readFileSync(new URL(`../data/${f}.json`, import.meta.url), "utf8"))

test("locale paths: Arabic at the root, English under /en, and back again", () => {
  assert.equal(localePath("ar", "/"), "/")
  assert.equal(localePath("en", "/"), "/en")
  assert.equal(localePath("ar", "/about"), "/about")
  assert.equal(localePath("en", "/about"), "/en/about")
  assert.equal(absoluteUrl("en", "/crossings/nasib"), `${SITE_URL}/en/crossings/nasib`)
  assert.equal(absoluteUrl("ar", "/"), SITE_URL, "root is the bare origin, matching the rendered canonical")
  assert.equal(absoluteUrl("en", "/"), `${SITE_URL}/en`)
  assert.deepEqual(splitLocale("/en"), { locale: "en", path: "/" })
  assert.deepEqual(splitLocale("/en/airlines"), { locale: "en", path: "/airlines" })
  assert.deepEqual(splitLocale("/airlines"), { locale: "ar", path: "/airlines" })
  // The internal /ar path a prerendered Arabic page sees maps to the same visible path.
  assert.deepEqual(splitLocale("/ar"), { locale: "ar", path: "/" })
  assert.deepEqual(splitLocale("/ar/from/turkiye/to/damascus"), { locale: "ar", path: "/from/turkiye/to/damascus" })
  assert.equal(localePath("en", splitLocale("/ar/crossings").path), "/en/crossings")
  assert.ok(!SITE_URL.endsWith("/") && !SITE_URL.includes("www."), "one canonical host, no trailing slash")
})

test("passport slugs round-trip and reject prototype keys", () => {
  for (const [id, slug] of Object.entries(PASSPORT_SLUGS)) assert.equal(passportFromSlug(slug), id)
  assert.equal(passportFromSlug("mars"), undefined)
  assert.equal(passportFromSlug("constructor"), undefined)
})

test("every origin, entry and airline gets a distinct, URL-safe slug", () => {
  const origins = load("origins") as { id: string; name: { en: string } }[]
  const originSlugs = origins.map((o) => slugify(o.name.en))
  assert.equal(new Set(originSlugs).size, originSlugs.length, "origins: duplicate slug")
  for (const s of originSlugs) assert.match(s, /^[a-z0-9]+(-[a-z0-9]+)*$/, `origins: ${s}`)
  for (const file of ["entries", "airlines"]) {
    const rec = load(file) as Record<string, { name: { en: string } }>
    const slugs = Object.values(rec).map((v) => slugify(v.name.en))
    assert.equal(new Set(slugs).size, slugs.length, `${file}: duplicate slug`)
    for (const s of slugs) assert.match(s, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${file}: ${s}`)
  }
  assert.equal(slugify("Türkiye"), "turkiye")
  assert.equal(slugify("Al-Qa'im"), "al-qaim")
  assert.equal(slugify("United Arab Emirates"), "united-arab-emirates")
})

test("fmt fills placeholders and leaves unknown ones visible", () => {
  assert.equal(fmt("{a} to {b}", { a: "x", b: 2 }), "x to 2")
  assert.equal(fmt("{a} {zz}", { a: "x" }), "x {zz}")
})

test("titles are unique per language and descriptions are search-snippet sized", () => {
  for (const locale of ["ar", "en"] as const) {
    const seo = getMessages(locale).seo
    const pages = [seo.home, seo.airlines, seo.crossings, seo.documents, seo.reports, seo.reportNew, seo.about]
    const titles = pages.map((p) => p.title)
    assert.equal(new Set(titles).size, titles.length, `${locale}: duplicate title`)
    for (const p of pages) {
      assert.ok(p.title.length >= 20 && p.title.length <= 90, `${locale} title length: ${p.title}`)
      assert.ok(p.description.length >= 60 && p.description.length <= 230, `${locale} description length: ${p.description}`)
    }
    // Templates must keep every placeholder they are filled with.
    assert.ok(seo.route.title.includes("{origin}") && seo.route.title.includes("{city}"))
    assert.ok(seo.entry.title.includes("{name}") && seo.entry.description.includes("{status}"))
    assert.ok(seo.airline.title.includes("{airline}"))
  }
})

test("Arabic and English message templates use the same placeholders", () => {
  // A placeholder in one language that the code never fills shows on the page as
  // literal "{passport}". Both languages must ask for exactly the same values.
  const holes = (t: string) => [...t.matchAll(/\{(\w+)\}/g)].map((x) => x[1]).sort().join(",")
  const walk = (ar: unknown, en: unknown, at: string) => {
    if (typeof ar === "string") {
      assert.equal(typeof en, "string", `${at}: English is missing`)
      assert.equal(holes(ar), holes(en as string), `${at}: placeholders differ between Arabic and English`)
      return
    }
    if (ar && typeof ar === "object") {
      for (const k of Object.keys(ar)) walk((ar as Record<string, unknown>)[k], (en as Record<string, unknown>)?.[k], `${at}.${k}`)
    }
  }
  walk(getMessages("ar"), getMessages("en"), "messages")
})
