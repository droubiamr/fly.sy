import type { NextConfig } from "next"
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"
import { SECURITY_HEADERS } from "./src/lib/security-headers"

const securityHeaders = Object.entries(SECURITY_HEADERS).map(([key, value]) => ({ key, value }))

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // Font files change with a deploy, never in place.
      { source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ]
  },
}

export default nextConfig

// `next dev` gets the wrangler.jsonc bindings (D1, the rate limiter) from a local Miniflare, so the database
// works without deploying. Development only: the build and the Worker never need it.
if (process.env.NODE_ENV === "development") initOpenNextCloudflareForDev()
