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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Root app-router layout: this link applies to every route. next/font is avoided so builds work offline. */}
        {/* Only the 500, 600 and 700 cuts are loaded: the thin 400 cut of Plex Sans Arabic reads poorly on screen, so
            ordinary text at weight 400 falls to Medium (see --font-sans in globals.css). */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <MessagesProvider locale={locale} m={m}>
          <AppShell>{children}</AppShell>
        </MessagesProvider>
      </body>
    </html>
  )
}
