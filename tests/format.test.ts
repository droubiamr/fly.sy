import { test } from "node:test"
import assert from "node:assert/strict"
import { formatDate, formatHours, formatMinutes } from "../src/lib/format.ts"

const EASTERN = /[٠-٩۰-۹]/

test("Arabic output uses Western digits with Arabic words", () => {
  for (const s of [formatDate("2026-09-20", "ar"), formatHours(2.5, "ar"), formatMinutes(45, "ar")!, formatMinutes(90, "ar")!]) {
    assert.doesNotMatch(s, EASTERN, s)
  }
  assert.match(formatDate("2026-09-20", "ar"), /20/)
  assert.match(formatDate("2026-09-20", "ar"), /2026/)
})

test("durations are words with Arabic counting forms", () => {
  assert.equal(formatHours(1, "ar"), "ساعة")
  assert.equal(formatHours(2.5, "ar"), "ساعتان و30 دقيقة")
  assert.equal(formatHours(2.7, "ar"), "ساعتان و40 دقيقة")
  assert.equal(formatHours(5.9, "ar"), "5 ساعات و55 دقيقة")
  assert.equal(formatHours(13.4, "ar"), "13 ساعة")
  assert.equal(formatHours(null, "ar"), "—")
  assert.equal(formatMinutes(45, "ar"), "45 دقيقة")
  assert.equal(formatMinutes(5, "ar"), "5 دقائق")
  assert.equal(formatMinutes(90, "ar"), "ساعة و30 دقيقة")
  assert.equal(formatMinutes(360, "ar"), "6 ساعات")
})

test("English durations", () => {
  assert.equal(formatDate("2026-09-20", "en"), "20 Sept 2026")
  assert.equal(formatHours(1, "en"), "1 hour")
  assert.equal(formatHours(2.5, "en"), "2 hours 30 minutes")
  assert.equal(formatHours(0.98, "en"), "1 hour")
  assert.equal(formatMinutes(45, "en"), "45 minutes")
  assert.equal(formatMinutes(90, "en"), "1 hour 30 minutes")
})

test("data files carry Western digits only, Arabic text included", async () => {
  const { readdirSync, readFileSync } = await import("node:fs")
  for (const f of readdirSync("data").filter((f) => f.endsWith(".json"))) {
    const text = readFileSync(`data/${f}`, "utf8")
    const hit = text.match(/[٠-٩۰-۹٫٬]/)
    assert.equal(hit, null, `data/${f} contains an Eastern Arabic digit or separator: ${hit?.[0]}`)
  }
})
