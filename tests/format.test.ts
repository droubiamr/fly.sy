import { test } from "node:test"
import assert from "node:assert/strict"
import { INTL_LOCALE, formatDate, formatDateTime, formatDuration, formatHours, formatHoursText, formatMinutes, hostOf, shortUrl, timeAgo } from "../src/lib/format.ts"

const EASTERN = /[٠-٩۰-۹]/

test("Arabic output uses Western digits with Arabic words", () => {
  for (const s of [formatDate("2026-09-20", "ar"), formatHours(2.5, "ar"), formatMinutes(45, "ar")!, formatMinutes(90, "ar")!]) {
    assert.doesNotMatch(s, EASTERN, s)
  }
  assert.match(formatDate("2026-09-20", "ar"), /20/)
  assert.match(formatDate("2026-09-20", "ar"), /2026/)
  assert.match(formatHours(2.5, "ar"), /2[.,٫]5 س$/)
  assert.equal(formatMinutes(45, "ar"), "45 دقيقة")
})

test("English output is unchanged", () => {
  assert.equal(formatDate("2026-09-20", "en"), "20 Sept 2026")
  assert.equal(formatHours(2.5, "en"), "~2.5 h")
  assert.equal(formatMinutes(45, "en"), "45 min")
  assert.equal(formatMinutes(90, "en"), "~1.5 h")
})

test("data files carry Western digits only, Arabic text included", async () => {
  const { readdirSync, readFileSync } = await import("node:fs")
  for (const f of readdirSync("data").filter((f) => f.endsWith(".json"))) {
    const text = readFileSync(`data/${f}`, "utf8")
    const hit = text.match(/[٠-٩۰-۹٫٬]/)
    assert.equal(hit, null, `data/${f} contains an Eastern Arabic digit or separator: ${hit?.[0]}`)
  }
})

test("hours in running text drop the tilde and spell the unit", () => {
  assert.equal(formatHoursText(2.7, "en"), "2.7 hours")
  assert.equal(formatHoursText(1, "en"), "1 hour")
  assert.equal(formatHoursText(2.5, "ar").replace(/[.,٫]/, "."), "2.5 ساعة")
  assert.doesNotMatch(formatHoursText(2.5, "ar"), EASTERN)
})

test("durations read as hours and minutes, to the nearest five minutes", () => {
  assert.equal(formatDuration(2.7, "en"), "2 h 40 min")
  assert.equal(formatDuration(2.3, "en"), "2 h 20 min")
  assert.equal(formatDuration(5.9, "en"), "5 h 55 min")
  assert.equal(formatDuration(8, "en"), "8 h")
  assert.equal(formatDuration(0.5, "en"), "30 min")
  assert.equal(formatDuration(2.7, "ar"), "2 س 40 د")
  assert.equal(formatDuration(null, "ar"), "—")
})

test("the last-updated time reads to the minute on the reader's clock, with no zone label", () => {
  const at = "2026-10-02T06:58:00Z"
  assert.equal(formatDateTime(at, "en", "UTC"), "2 Oct 2026, 06:58")
  assert.equal(formatDateTime(at, "en", "Europe/Berlin"), "2 Oct 2026, 08:58")
  assert.equal(formatDateTime(at, "en", "Asia/Damascus"), "2 Oct 2026, 09:58")
  // Late enough in UTC to be the next day further east.
  assert.equal(formatDateTime("2026-10-02T22:30:00Z", "en", "Asia/Damascus"), "3 Oct 2026, 01:30")
  const ar = formatDateTime(at, "ar", "Asia/Damascus")
  assert.doesNotMatch(ar, EASTERN, ar)
  assert.match(ar, /تشرين الأول 2026/)
  assert.match(ar, /09:58/)
  // A timestamp still formats as its UTC day where only the day is wanted.
  assert.equal(formatDate(at, "en"), "2 Oct 2026")
})

test("how long ago reads in the largest whole unit", () => {
  const at = "2026-10-02T06:58:00Z"
  const t = Date.parse(at)
  const ago = (ms: number, locale: "ar" | "en" = "en") => timeAgo(at, INTL_LOCALE[locale], t + ms)
  const min = 60_000
  assert.equal(ago(20_000), "now")
  assert.equal(ago(-5 * min), "now") // a reader's clock running behind
  assert.equal(ago(5 * min), "5 minutes ago")
  assert.equal(ago(2 * 60 * min + 50 * min), "2 hours ago")
  assert.equal(ago(26 * 60 * min), "yesterday")
  assert.equal(ago(3 * 24 * 60 * min), "3 days ago")
  assert.equal(ago(2 * 60 * min, "ar"), "قبل ساعتين")
  assert.equal(ago(3 * 60 * min, "ar"), "قبل 3 ساعات")
})

test("timeAgo is self-contained, so its source runs as the page's inline script", () => {
  const inlined = new Function(`return (${timeAgo})`)() as typeof timeAgo
  const now = Date.parse("2026-10-02T09:00:00Z")
  assert.equal(inlined("2026-10-02T06:58:00Z", "en-GB", now), "2 hours ago")
  assert.equal(inlined("2026-10-02T06:58:00Z", INTL_LOCALE.ar, now), "قبل ساعتين")
})

test("addresses read as in the address bar: no scheme, no www, no trailing slash or query", () => {
  assert.equal(hostOf("https://damairport.gov.sy/en"), "damairport.gov.sy")
  assert.equal(hostOf("https://www.general-security.gov.lb/ar/posts/572"), "general-security.gov.lb")
  assert.equal(shortUrl("https://t.me/SyrGACA"), "t.me/SyrGACA")
  assert.equal(shortUrl("https://www.facebook.com/SyrGACA/"), "facebook.com/SyrGACA")
  assert.equal(shortUrl("https://www.youtube.com/@SyGACA"), "youtube.com/@SyGACA")
  assert.equal(shortUrl("https://play.google.com/store/apps/details?id=sy.mofa.app"), "play.google.com/store/apps/details")
})
