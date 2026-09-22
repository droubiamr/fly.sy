import type { Metadata, Viewport } from "next"
import { getI18n } from "@/lib/i18n"
import { AppShell } from "@/components/app-shell"
import { MessagesProvider } from "@/components/messages-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "fly.sy — كيف تصل إلى سوريا",
  description: "كل طريق إلى سوريا، مع مصدر كل معلومة وتاريخ مراجعتها. موقع مستقل غير رسمي.",
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
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Readex+Pro:wght@300;400;500;600;700&display=swap"
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
