// Starts the production server, walks the sitemap and checks what a crawler
// would see on every page: status, canonical, hreflang, lang/dir, one h1,
// parseable JSON-LD, unique titles. Then the redirects and 404s.
//   npm run build && node scripts/smoke.mjs
import { spawn } from "node:child_process"

const PORT = 3123
const ORIGIN = `http://localhost:${PORT}`
const SITE = "https://fly.sy"

// Its own process group, so the stop kills the real next-server and not only the npx wrapper,
// and nothing of ours is inherited that could keep a caller's pipe open after we exit.
const server = spawn("npx", ["next", "start", "-p", String(PORT)], { stdio: "ignore", detached: true })
const stop = () => {
  try {
    process.kill(-server.pid, "SIGTERM")
  } catch {}
}
process.on("exit", stop)
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => process.exit(1))

const get = (url, init = {}) => fetch(url, { signal: AbortSignal.timeout(20000), ...init })

const wait = async () => {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await get(`${ORIGIN}/robots.txt`)).ok) return
    } catch {}
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error("server did not start")
}

const failures = []
const check = (cond, msg) => cond || failures.push(msg)
const attr = (html, re) => html.match(re)?.[1]
const count = (html, re) => (html.match(re) ?? []).length

await wait()

const robots = await (await get(`${ORIGIN}/robots.txt`)).text()
check(robots.includes(`Sitemap: ${SITE}/sitemap.xml`), "robots.txt names the sitemap")
check(!/Disallow:\s*\/\s*$/m.test(robots), "robots.txt does not block the site")

const manifest = await get(`${ORIGIN}/manifest.webmanifest`)
check(manifest.ok, "manifest served")

const xml = await (await get(`${ORIGIN}/sitemap.xml`)).text()
const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
check(locs.length > 100, `sitemap has ${locs.length} urls`)
check(new Set(locs).size === locs.length, "sitemap urls are unique")
check(locs.every((u) => u.startsWith(SITE + "/") || u === SITE), "sitemap urls are absolute on the canonical host")
check(count(xml, /hreflang="x-default"/g) === locs.length, "every sitemap entry carries x-default")

const titles = new Map()
const checkPage = async (loc) => {
  const path = loc.slice(SITE.length) || "/"
  const res = await get(ORIGIN + path)
  const html = await res.text()
  const where = (m) => `${path}: ${m}`
  check(res.status === 200, where(`status ${res.status}`))
  const en = path === "/en" || path.startsWith("/en/")
  check(attr(html, /<html[^>]*\slang="([^"]+)"/) === (en ? "en" : "ar"), where("html lang"))
  check(attr(html, /<html[^>]*\sdir="([^"]+)"/) === (en ? "ltr" : "rtl"), where("html dir"))
  check(attr(html, /<link rel="canonical" href="([^"]+)"/) === loc, where("canonical = url"))
  check(count(html, /<link rel="alternate" hrefLang="/g) === 3, where("3 hreflang links"))
  const arPath = en ? path.replace(/^\/en/, "") : path
  check(html.includes(`hrefLang="x-default" href="${arPath === "/" || arPath === "" ? SITE : SITE + arPath}"`), where("x-default is the Arabic page"))
  check(count(html, /<h1[\s>]/g) === 1, where("exactly one h1"))
  const title = attr(html, /<title>([^<]+)<\/title>/)
  check(Boolean(title), where("has title"))
  check(Boolean(attr(html, /<meta name="description" content="([^"]+)"/)), where("has description"))
  check(html.includes('<meta property="og:image"'), where("og:image"))
  if (path.endsWith("/reports/new")) check(html.includes('name="robots" content="noindex'), where("noindex"))
  else check(!html.includes("noindex"), where("indexable"))
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([^<]*)<\/script>/g)) {
    try {
      const d = JSON.parse(json)
      check(d["@context"] === "https://schema.org" && Array.isArray(d["@graph"]), where("json-ld shape"))
    } catch {
      failures.push(where("json-ld parses"))
    }
  }
  if (titles.has(title)) failures.push(where(`title also used by ${titles.get(title)}`))
  titles.set(title, path)
}
// A handful at a time: fast enough to be run by hand, gentle enough for a single Node server.
const queue = [...locs]
await Promise.all(Array.from({ length: 8 }, async () => {
  while (queue.length) await checkPage(queue.shift())
}))

const redirect = async (from, to) => {
  const r = await get(ORIGIN + from, { redirect: "manual" })
  const loc = r.headers.get("location") ?? ""
  check(r.status === 308 && (loc === to || loc === ORIGIN + to), `${from} → ${to} (got ${r.status} ${loc})`)
}
await redirect("/ar", "/")
await redirect("/ar/about", "/about")
// Old region ids map to a country (eu → Germany), cities without an airport land on Damascus.
await redirect("/?from=lb&to=homs", "/from/lebanon/to/damascus")
await redirect("/?from=LB&to=aleppo", "/from/lebanon/to/aleppo")
await redirect("/en?from=eu&to=aleppo&p=voa", "/en/from/germany/to/aleppo?p=voa")
await redirect("/from/lebanon/to/damascus/visa-on-arrival", "/from/lebanon/to/damascus?p=voa")
await redirect("/en/from/lebanon/to/damascus/pre-approval", "/en/from/lebanon/to/damascus?p=res")
await redirect("/from/lebanon/to/damascus/syrian-passport", "/from/lebanon/to/damascus")
await redirect("/?from=nope", "/from/turkiye/to/damascus")
await redirect("/?from=constructor&p=__proto__", "/from/turkiye/to/damascus")
await redirect("/ar?from=LB&to=aleppo", "/from/lebanon/to/aleppo")

// A 404 under a dynamic root layout is served in Next's own bare document, so what is
// checked is the status and that the bilingual page (both languages) is what came back.
for (const path of ["/nope", "/en/nope", "/crossings/nope", "/en/from/mars/to/damascus", "/from/lebanon/to/homs", "/from/lebanon/to/damascus/nope", "/nope.txt", "/airlines/constructor", "/en/airlines/__proto__", "/crossings/toString", "/from/constructor/to/damascus"]) {
  const r = await get(ORIGIN + path)
  const html = await r.text()
  check(r.status === 404, `${path} is 404 (got ${r.status})`)
  check(html.includes("Page not found") && html.includes("الصفحة غير موجودة"), `${path} shows the bilingual 404`)
  check(html.includes('name="robots" content="noindex'), `${path} 404 is noindex`)
}

const hdr = await get(ORIGIN + "/")
check(hdr.headers.get("x-content-type-options") === "nosniff", "security headers present")

stop()
console.log(`${locs.length} sitemap urls, ${titles.size} unique titles, ${failures.length} failures`)
for (const f of failures) console.log("  ✗", f)
process.exit(failures.length ? 1 : 0)
