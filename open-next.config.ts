import { defineCloudflareConfig } from "@opennextjs/cloudflare"

// No incremental cache override: every route here is server-rendered on demand,
// so there is nothing to cache between requests and no R2 bucket to create.
export default defineCloudflareConfig()
