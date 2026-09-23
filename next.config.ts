import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // The airlines tab became the flights section; keep old links working.
  redirects: async () => [{ source: "/airlines", destination: "/flights", permanent: true }],
}

export default nextConfig
