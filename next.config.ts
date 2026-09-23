import type { NextConfig } from "next"
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"

/* Sent on every response. HSTS only matters once the site is on HTTPS, which Cloudflare provides. */
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
]

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
