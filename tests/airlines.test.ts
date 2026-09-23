import { test } from "node:test"
import assert from "node:assert/strict"
import { existsSync } from "node:fs"
import airlines from "../data/airlines.json" with { type: "json" }

test("every airline has a light and a dark logo in public/airlines", () => {
  for (const code of Object.keys(airlines)) {
    assert.ok(existsSync(`public/airlines/${code}.png`), `public/airlines/${code}.png`)
    assert.ok(existsSync(`public/airlines/dark/${code}.png`), `public/airlines/dark/${code}.png`)
  }
})
