import { test } from "node:test"
import assert from "node:assert/strict"
import {
  change,
  clientIp,
  countryFrom,
  deviceFrom,
  fillSeries,
  isVisitorId,
  localeOfPath,
  niceScale,
  normalizePath,
  rangeWindow,
  sourceFrom,
} from "../src/lib/analytics.ts"
import { checkAdminPassword, hashPassword, newSessionToken, safeEqual, tokenHash, totpFor, totpStep, verifyPassword, newTotpSecret } from "../src/lib/auth-crypto.ts"

const OWN = ["fly.sy", "localhost"]

test("paths lose their query, hash and trailing slash; anything that is not a site path is dropped", () => {
  assert.equal(normalizePath("/"), "/")
  assert.equal(normalizePath("/en/airlines/"), "/en/airlines")
  assert.equal(normalizePath("/from/de/to/damascus?p=voa#top"), "/from/de/to/damascus")
  assert.equal(normalizePath("https://evil.example/x"), null)
  assert.equal(normalizePath("//evil.example/x"), null)
  assert.equal(normalizePath("/a b"), null)
  assert.equal(normalizePath("/" + "x".repeat(300)), null)
  assert.equal(normalizePath(42), null)
})

test("locale comes from the path", () => {
  assert.equal(localeOfPath("/"), "ar")
  assert.equal(localeOfPath("/airlines"), "ar")
  assert.equal(localeOfPath("/en"), "en")
  assert.equal(localeOfPath("/en/about"), "en")
  assert.equal(localeOfPath("/entries"), "ar")
})

test("source: utm_source wins, then the referring host; the site itself is not a source", () => {
  assert.equal(sourceFrom("https://www.google.com/search?q=x", null, OWN), "google.com")
  assert.equal(sourceFrom("https://fly.sy/en", null, OWN), null)
  assert.equal(sourceFrom("https://www.fly.sy/", null, OWN), null)
  assert.equal(sourceFrom("https://t.co/abc", "Newsletter", OWN), "newsletter")
  assert.equal(sourceFrom("", "<script>", OWN), null)
  assert.equal(sourceFrom("javascript:alert(1)", null, OWN), null)
  assert.equal(sourceFrom("not a url", null, OWN), null)
})

test("country drops Cloudflare's placeholders", () => {
  assert.equal(countryFrom("de"), "DE")
  assert.equal(countryFrom("XX"), null)
  assert.equal(countryFrom("T1"), null)
  assert.equal(countryFrom(null), null)
  assert.equal(countryFrom("DEU"), null)
})

test("device: undefined means desktop", () => {
  assert.equal(deviceFrom(undefined), "desktop")
  assert.equal(deviceFrom("mobile"), "mobile")
  assert.equal(deviceFrom("tablet"), "tablet")
  assert.equal(deviceFrom("smarttv"), "other")
})

test("visitor ids are UUIDs and nothing else", () => {
  assert.ok(isVisitorId(crypto.randomUUID()))
  assert.ok(!isVisitorId("not-a-uuid"))
  assert.ok(!isVisitorId(undefined))
})

test("ranges: whole buckets, and a previous window of the same length", () => {
  const now = new Date("2026-09-23T13:45:00Z")
  const d7 = rangeWindow("7d", now)
  assert.equal(d7.until.toISOString(), "2026-09-24T00:00:00.000Z")
  assert.equal(d7.since.toISOString(), "2026-09-17T00:00:00.000Z")
  assert.equal(d7.prevSince.toISOString(), "2026-09-10T00:00:00.000Z")
  assert.equal(d7.bucket, "day")
  const h = rangeWindow("24h", now)
  assert.equal(h.until.toISOString(), "2026-09-23T14:00:00.000Z")
  assert.equal(h.since.toISOString(), "2026-09-22T14:00:00.000Z")
  assert.equal(h.bucket, "hour")

  const filled = fillSeries([{ t: "2026-09-18T00:00:00+00:00", views: 5, visitors: 2 }], d7.since, d7.until, "day")
  assert.equal(filled.length, 7)
  assert.deepEqual(filled[1], { t: "2026-09-18T00:00:00.000Z", views: 5, visitors: 2 })
  assert.equal(filled[0].views, 0)
})

test("axis scale is round and covers the data", () => {
  assert.deepEqual(niceScale(0), { top: 4, step: 1 })
  assert.deepEqual(niceScale(3), { top: 3, step: 1 })
  assert.deepEqual(niceScale(7), { top: 8, step: 2 })
  assert.deepEqual(niceScale(130), { top: 150, step: 50 })
  for (const n of [1, 9, 11, 99, 101, 999, 12345]) {
    const { top, step } = niceScale(n)
    assert.ok(top >= n && Number.isInteger(step) && top / step <= 5, `${n} → ${top}/${step}`)
  }
})

test("change is null with nothing to compare against", () => {
  assert.equal(change(10, 0), null)
  assert.equal(change(15, 10), 0.5)
})

test("client IP comes from Cloudflare's header and is only ever an address", () => {
  const h = (o: Record<string, string>) => ({ get: (k: string) => o[k] ?? null })
  assert.equal(clientIp(h({ "cf-connecting-ip": "203.0.113.7" })), "203.0.113.7")
  assert.equal(clientIp(h({ "cf-connecting-ip": "2001:db8::1" })), "2001:db8::1")
  assert.equal(clientIp(h({ "x-forwarded-for": "198.51.100.2, 10.0.0.1" })), "198.51.100.2")
  assert.equal(clientIp(h({ "cf-connecting-ip": "<script>" })), null)
  assert.equal(clientIp(h({})), null)
})

test("passwords: PBKDF2 at 100,000 iterations, salted, and only the right one verifies", async () => {
  const stored = await hashPassword("correct horse battery staple")
  assert.match(stored, /^pbkdf2-sha256:100000:[A-Za-z0-9_-]{22}:[A-Za-z0-9_-]{43}$/)
  assert.notEqual(stored, await hashPassword("correct horse battery staple"), "salted")
  assert.ok(await verifyPassword("correct horse battery staple", stored))
  assert.ok(!(await verifyPassword("correct horse battery stapl", stored)))
  assert.ok(!(await verifyPassword("anything", "not-a-hash")))
  assert.ok(!(await verifyPassword("", stored)))
})

test("session tokens: 256 random bits, stored only as a hash", async () => {
  const t = newSessionToken()
  assert.match(t, /^[A-Za-z0-9_-]{43}$/)
  assert.notEqual(t, newSessionToken())
  assert.match(await tokenHash(t), /^[0-9a-f]{64}$/)
  assert.ok(await safeEqual("abc", "abc"))
  assert.ok(!(await safeEqual("abc", "abd")))
})

test("TOTP: the current code passes with one step of drift, anything else fails", () => {
  const secret = newTotpSecret()
  assert.match(secret, /^[A-Z2-7]{32}$/)
  const now = Date.UTC(2026, 8, 23, 12, 0, 10)
  const code = totpFor(secret).generate({ timestamp: now })
  const step = Math.floor(now / 30000)
  assert.equal(totpStep(secret, code, now), step)
  assert.equal(totpStep(secret, code, now + 30000), step, "previous step still accepted, reported as its own step")
  assert.equal(totpStep(secret, code, now + 90000), null, "too old")
  assert.equal(totpStep(secret, "12345", now), null)
  assert.equal(totpStep(secret, "abcdef", now), null)
  assert.equal(totpStep("not base32!", code, now), null)
})

test("admin password: the hash wins when set; a plain secret works without one and must be 12+ characters", async () => {
  const hash = await hashPassword("correct horse battery staple")
  assert.ok(await checkAdminPassword("correct horse battery staple", { passwordHash: hash, password: "" }))
  assert.ok(!(await checkAdminPassword("other password here", { passwordHash: hash, password: "other password here" })))
  assert.ok(await checkAdminPassword("a long enough secret", { passwordHash: "", password: "a long enough secret" }))
  assert.ok(!(await checkAdminPassword("a long enough secre", { passwordHash: "", password: "a long enough secret" })))
  assert.ok(!(await checkAdminPassword("short", { passwordHash: "", password: "short" })))
  assert.ok(!(await checkAdminPassword("", { passwordHash: "", password: "" })))
})
