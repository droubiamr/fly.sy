import { test } from "node:test"
import assert from "node:assert/strict"
import { formatDate, formatDateTime, formatDuration, formatHours, formatHoursText, formatMinutes } from "../src/lib/format.ts"

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

test("the last-updated time reads to the minute, with the reader's zone", () => {
  const at = "2026-10-02T06:58:00Z"
  assert.equal(formatDateTime(at, "en", "UTC"), "2 Oct 2026, 06:58 UTC")
  assert.equal(formatDateTime(at, "en", "Europe/Berlin"), "2 Oct 2026, 08:58 CEST")
  assert.equal(formatDateTime(at, "en", "Asia/Damascus"), "2 Oct 2026, 09:58 GMT+3")
  // Late enough in UTC to be the next day further east.
  assert.match(formatDateTime("2026-10-02T22:30:00Z", "en", "Asia/Damascus"), /^3 Oct 2026, 01:30/)
  const ar = formatDateTime(at, "ar", "Asia/Damascus")
  assert.doesNotMatch(ar, EASTERN, ar)
  assert.match(ar, /تشرين الأول 2026/)
  assert.match(ar, /09:58/)
  // A timestamp still formats as its UTC day where only the day is wanted.
  assert.equal(formatDate(at, "en"), "2 Oct 2026")
})
