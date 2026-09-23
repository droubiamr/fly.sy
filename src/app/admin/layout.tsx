import type { Metadata, Viewport } from "next"
import { SITE_URL } from "@/lib/site"
import "../globals.css"

// A second root layout, beside app/[lang]: the dashboard is English, left to right, and has none of the
// public site's chrome. Crossing between the two is a full page load, which is fine for an admin area.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Admin · fly.sy", template: "%s · fly.sy admin" },
  robots: { index: false, follow: false, nocache: true },
  // The site's share card (app/opengraph-image.png) would otherwise apply here too. A private page has no card.
  openGraph: null,
  twitter: null,
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1512" },
  ],
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preload" href="/fonts/readex-pro-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}
