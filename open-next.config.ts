import { defineCloudflareConfig } from "@opennextjs/cloudflare"
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache"

// Almost every page is prerendered at build. Without an incremental cache the
// Worker would re-render each one on every request, world map included, and
// run past its CPU limit (Cloudflare error 1102). This cache serves the
// prerendered pages from the static assets bundle: no R2, no KV, no
// revalidation, which is right for a site that changes only on deploy.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
})
