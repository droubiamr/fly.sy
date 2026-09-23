import type { Metadata, Viewport } from "next"
import { getI18n } from "@/lib/i18n"
import { SITE_URL } from "@/lib/site"
import { AppShell } from "@/components/app-shell"
import { MessagesProvider } from "@/components/messages-provider"
import "./globals.css"

// Icons, the manifest and the share card come from files next to this one
// (icon.svg, favicon.ico, apple-icon.png, manifest.ts, opengraph-image.png), which
// the app router turns into <link> and <meta> tags on its own. Regenerate the
// rasters from icon.svg with `npm run icons`.
export async function generateMetadata(): Promise<Metadata> {
  const { locale, m } = await getI18n()
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: m.meta.title, template: "%s · fly.sy" },
    description: m.meta.description,
    applicationName: "fly.sy",
    openGraph: {
      type: "website",
      siteName: "fly.sy",
      locale: locale === "ar" ? "ar_SY" : "en_GB",
      title: m.meta.title,
      description: m.meta.description,
    },
    twitter: { card: "summary_large_image" },
    appleWebApp: { title: "fly.sy", statusBarStyle: "default" },
    // Phone numbers in route notes are not for tapping, and the URL is not a link
    // Safari should guess at.
    formatDetection: { telephone: false, address: false, email: false },
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Android Chrome otherwise leaves the layout viewport at full height when the
  // keyboard opens, so the bottom nav ends up underneath it.
  interactiveWidget: "resizes-content",
  colorScheme: "light dark",
  // One value per scheme, matched to the colour at the very top of the page.
  // A single value gives one scheme a status bar that does not belong to it.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1512" },
  ],
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, m } = await getI18n()
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <head>
        {/* Root app-router layout: this applies to every route. The fonts live in public/fonts
            (see the @font-face rules in globals.css), so no font CDN is contacted and builds work
            offline. Preloading skips the wait for the stylesheet before the first-paint faces are
            fetched: Geist everywhere, and the Plex Sans Arabic Medium cut on Arabic pages. */}
        <link
          rel="preload"
          href="/fonts/Geist-Variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {locale === "ar" && (
          <link
            rel="preload"
            href="/fonts/IBMPlexSansArabic-500-arabic.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body>
        <MessagesProvider locale={locale} m={m}>
          <AppShell>{children}</AppShell>
        </MessagesProvider>
      </body>
    </html>
  )
}
