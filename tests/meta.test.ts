import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

// Reads the JSON directly and imports nothing from src, so the sweep Routine can run it
// on a fresh clone without npm install: node --experimental-strip-types --test tests/meta.test.ts
const meta = JSON.parse(readFileSync(new URL("../data/meta.json", import.meta.url), "utf8"))

test("meta: updated is a UTC timestamp to the minute, not in the future", () => {
  // The footer shows it on each reader's own clock, so it has to say which moment, in UTC.
  assert.match(meta.updated, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, `updated ${meta.updated}`)
  const t = Date.parse(meta.updated)
  assert.ok(!Number.isNaN(t), `updated ${meta.updated}`)
  assert.ok(t <= Date.now() + 60 * 60 * 1000, `updated ${meta.updated} is in the future`)
})
