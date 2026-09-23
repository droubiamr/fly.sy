import Link from "next/link"
import { Plus } from "lucide-react"
import { getI18n } from "@/lib/i18n"
import { localePath } from "@/lib/site"
import type { Locale } from "@/lib/types"
import { BottomNav } from "@/components/bottom-nav"
import { Disclaimer } from "@/components/disclaimer"
import { LangSwitch } from "@/components/lang-switch"
import { Logo } from "@/components/logo"
import { MainNav } from "@/components/main-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { SiteFooter } from "@/components/site-footer"
import { Ticker } from "@/components/ticker"
import { Button } from "@/components/ui/button"

/**
 * The frame every page sits in, laid out the way Linkat's is: the status
 * ticker, a sticky header on the blurred page colour (brand, the sections in
 * the middle on desktop, language, light/dark and one pill action at the end),
 * then the page, then the footer. Pages bring their own green panel and
 * container; the shell adds no width of its own.
 */
export function AppShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const { m } = getI18n(locale)
  return (
    <div className="flex min-h-dvh flex-col">
      <Ticker locale={locale} />

      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
        <div className="container-app grid h-16 grid-cols-[1fr_auto] items-center xl:grid-cols-[1fr_auto_1fr]">
          {/* dir="ltr": the wordmark is a Latin name and must never be
              reordered by the surrounding Arabic. */}
          <Link href={localePath(locale, "/")} dir="ltr" aria-label={m.meta.title} className="flex items-center gap-2 justify-self-start text-lg font-semibold tracking-tight">
            <Logo className="size-6 text-primary" />
            fly.sy
          </Link>

          <MainNav />

          <div className="flex items-center justify-end gap-1">
            <LangSwitch className="me-1" />
            <ModeToggle />
            <Button asChild size="sm" className="ms-1 hidden h-9 rounded-full px-4 md:inline-flex">
              <Link href={localePath(locale, "/reports/new")}>
                <Plus data-icon="inline-start" />
                {m.reports.add}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
      <SiteFooter locale={locale} />
      <BottomNav />
      <Disclaimer />
    </div>
  )
}
