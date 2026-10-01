import { test } from "node:test"
import assert from "node:assert/strict"
import { pageKey, segmentFile } from "../src/lib/static-route.ts"

const key = (url: string) => {
  const u = new URL(url, "https://fly.sy")
  return pageKey(u.pathname, u.searchParams)
}

test("static route: a URL maps to the prerendered page the proxy would rewrite it to", () => {
  assert.equal(key("/"), "/ar")
  assert.equal(key("/crossings"), "/ar/crossings")
  assert.equal(key("/from/turkiye/to/damascus?p=voa"), "/ar/from/turkiye/to/damascus")
  assert.equal(key("/en"), "/en")
  assert.equal(key("/en/news"), "/en/news")
})

test("static route: whatever the proxy redirects, and the app's own paths, stay with Next", () => {
  for (const url of ["/ar", "/ar/news", "/?from=LB", "/en?to=aleppo", "/ar?p=voa", "/crossings/", "/en/", "/admin", "/admin/login", "/api/track", "/api/search/ar"])
    assert.equal(key(url), null, url)
})

test("static route: a segment key becomes a URL-safe asset name, the same in the build and the Worker", () => {
  for (const s of ["/_tree", "/$d$lang", "/$d$lang/!KHNpdGUp/crossings/$d$slug/__PAGE__"]) {
    assert.equal(segmentFile(s), Buffer.from(s).toString("base64url"))
    assert.match(segmentFile(s), /^[A-Za-z0-9_-]+$/)
  }
})
