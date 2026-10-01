// Copies every prerendered page and file out of the Next build into the Worker's static assets, one asset per
// response, so worker.ts can answer a page load, a prefetch or /icon.svg without starting Next.js. Run by the
// wrangler build (wrangler.jsonc → build.command) after `opennextjs-cloudflare build`, before every deploy,
// preview upload and `wrangler dev`.
//
// Pages land at cdn-cgi/_pages/<page>.page (the HTML; not .html, which the assets router would redirect) and
// cdn-cgi/_pages/<page>.seg/<segment> (the prefetch segments); files at cdn-cgi/_pages/<path>.body. Nothing
// under cdn-cgi/ is served to the public: only the Worker reads it, through the ASSETS binding.
// .open-next/static-pages.json lists them, with the headers Next would have sent, for worker.ts to bundle.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"
import { segmentFile } from "../src/lib/static-route.ts"

const APP = ".next/server/app"
const OUT = ".open-next/assets/cdn-cgi/_pages"
const MANIFEST = ".open-next/static-pages.json"

const copy = (from, to) => {
  mkdirSync(dirname(to), { recursive: true })
  cpSync(from, to)
}
// Cache tags are for Next's own revalidation and never reach the browser.
const sent = (headers = {}) => Object.fromEntries(Object.entries(headers).filter(([k]) => k !== "x-next-cache-tags"))

const routes = JSON.parse(readFileSync(".next/prerender-manifest.json", "utf8")).routes
rmSync(OUT, { recursive: true, force: true })
const pages = []
const files = {}
let pageHeaders = null

for (const [route, info] of Object.entries(routes)) {
  // Next's own error pages are not addressable, and a page prerendered with another status (a 404) stays with Next.
  if (route.startsWith("/_") || (info.initialStatus ?? 200) !== 200) continue
  const meta = JSON.parse(readFileSync(`${APP}${route}.meta`, "utf8"))
  if (info.dataRoute === null) {
    // A route handler prerendered to a file: icon.svg, robots.txt, sitemap.xml, data/*.json…
    if ((meta.status ?? 200) !== 200) continue
    copy(`${APP}${route}.body`, `${OUT}${route}.body`)
    files[route] = sent(meta.headers)
    continue
  }
  copy(`${APP}${route}.html`, `${OUT}${route}.page`)
  for (const segment of meta.segmentPaths ?? [])
    copy(`${APP}${route}.segments${segment}.segment.rsc`, `${OUT}${route}.seg/${segmentFile(segment)}`)
  // Every page here is static and carries the same headers; one that differs needs worker.ts to learn about it.
  const h = JSON.stringify(sent(meta.headers))
  if (pageHeaders !== null && h !== pageHeaders) throw new Error(`${route} sends ${h}, the other pages ${pageHeaders}`)
  pageHeaders = h
  pages.push(route)
}

if (pages.length === 0) throw new Error("no prerendered pages found: run `opennextjs-cloudflare build` first")
writeFileSync(MANIFEST, JSON.stringify({ pages, pageHeaders: JSON.parse(pageHeaders), files }))
console.log(`static pages: ${pages.length} pages and ${Object.keys(files).length} files copied to ${OUT}`)
