import { test } from "node:test"
import assert from "node:assert/strict"
import { existsSync, readdirSync, readFileSync } from "node:fs"

// On Cloudflare every prerendered page is served from the static-assets incremental cache (open-next.config.ts),
// which stores a page at <build id>/<path>.cache and looks it up by the key Next asks for. Next 16.3.8 started
// asking for /route-cache/<kind>/<sha256>/$<path> instead. @opennextjs/cloudflare 1.20.7 does not know that key,
// so every lookup missed, the Worker rendered every page on every request, world map included, and production
// answered with error 1102. This fails while the installed Next uses those keys and the adapter never mentions
// them. Before trusting a pass after an upgrade, run `npm run preview` and look for `x-nextjs-cache: HIT` on a page.
const modules = new URL("../node_modules/", import.meta.url)
const nextUsesRouteCacheKeys = () => existsSync(new URL("next/dist/server/lib/route-cache-key.js", modules))
const adapterKnowsRouteCacheKeys = () =>
  ["@opennextjs/aws/dist/", "@opennextjs/cloudflare/dist/"].some((dir) => {
    const root = new URL(dir, modules)
    return (readdirSync(root, { recursive: true }) as string[]).some(
      (f) => f.endsWith(".js") && readFileSync(new URL(f, root), "utf8").includes("route-cache"),
    )
  })

test("worker cache: the adapter can find the pages Next prerendered", { skip: !existsSync(new URL("next/", modules)) && "no node_modules" }, () => {
  assert.ok(
    !nextUsesRouteCacheKeys() || adapterKnowsRouteCacheKeys(),
    "next keys its cache under /route-cache/ and @opennextjs/cloudflare does not read those keys: every page would " +
      "render on every request on Cloudflare (error 1102). Keep next at 16.3.7 until the adapter supports them.",
  )
})
