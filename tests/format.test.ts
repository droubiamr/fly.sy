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
  assert.match(formatHours(2.5, "ar"), /2[.,٫]5 س$/)
  assert.equal(formatMinutes(45, "ar"), "45 دقيقة")
})

test("English output is unchanged", () => {
  assert.equal(formatDate("2026-09-20", "en"), "20 Sept 2026")
  assert.equal(formatHours(2.5, "en"), "~2.5 h")
  assert.equal(formatMinutes(45, "en"), "45 min")
  assert.equal(formatMinutes(90, "en"), "~1.5 h")
})
