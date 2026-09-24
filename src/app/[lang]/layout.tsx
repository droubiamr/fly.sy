import type { Metadata, Viewport } from "next"
import { getI18n } from "@/lib/i18n"
import { LOCALES, SITE_NAME, SITE_URL } from "@/lib/site"
import { AppShell } from "@/components/app-shell"
import { MessagesProvider } from "@/components/messages-provider"
import "../globals.css"

type Props = { children: React.ReactNode; params: Promise<{ lang: string }> }

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }))
}

// Icons, the manifest and the share card come from files in app/ (icon.svg,
// favicon.ico, apple-icon.png, manifest.ts, opengraph-image.png), which the app
// router turns into <link> and <meta> tags on its own. Regenerate the rasters
// from icon.svg with `npm run icons`. Each page supplies its own title,
// description, canonical and hreflang through pageMetadata().
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const { m } = getI18n(lang)
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: m.meta.title, template: `%s · ${SITE_NAME}` },
    description: m.meta.description,
    applicationName: SITE_NAME,
    appleWebApp: { title: SITE_NAME, statusBarStyle: "default" },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    // Phone numbers in route notes are not for tapping, and the URL is not a link
    // Safari should guess at.
    formatDetection: { telephone: false, address: false, email: false },
    // Paste the value of the Search Console "HTML tag" method into .env.local as
    // NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION. Left out of the page when unset.
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
      : {}),
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
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111e1a" },
  ],
}

export default async function RootLayout({ children, params }: Props) {
  const { lang } = await params
  // A root layout cannot 404 cleanly (a throw here is a 500), so an unknown
  // lang falls back to Arabic and every page below rejects it with requireLocale().
  const { locale, m } = getI18n(lang)
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <head>
        {/* The one font subset this language needs goes out with the HTML; the other is fetched only if a glyph calls for it. */}
        <link
          rel="preload"
          href={locale === "ar" ? "/fonts/readex-pro-arabic.woff2" : "/fonts/readex-pro-latin.woff2"}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <MessagesProvider locale={locale} m={m}>
          <AppShell locale={locale}>{children}</AppShell>
        </MessagesProvider>
      </body>
    </html>
  )
}
