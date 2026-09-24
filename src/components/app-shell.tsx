import Link from "next/link"
import { getI18n } from "@/lib/i18n"
import { localePath } from "@/lib/site"
import type { Locale } from "@/lib/types"
import { BottomNav } from "@/components/bottom-nav"
import { Disclaimer } from "@/components/disclaimer"
import { LangSwitch } from "@/components/lang-switch"
import { SiteFooter } from "@/components/site-footer"
import { VisitTracker } from "@/components/visit-tracker"

export function AppShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const { m } = getI18n(locale)
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col">
      {/* A solid bar with a border, not a floating translucent pill: navigation
          that the page shows through reads as decoration, and the language
          switch is the one control an older reader must find at once. Not
          sticky: the phone's height is better spent on the question. */}
      <header className="flex h-16 items-center justify-between border-b-[1.5px] bg-card px-5">
        {/* dir="ltr" because the wordmark is a Latin name and must never be
            reordered by the surrounding Arabic. */}
        <Link
          href={localePath(locale, "/")}
          dir="ltr"
          aria-label={m.meta.title}
          className="inline-flex h-12 items-center text-2xl font-bold tracking-tight"
        >
          fly<span className="text-primary">.sy</span>
        </Link>
        <LangSwitch />
      </header>

      <main className="flex-1 px-5 pt-5 pb-8">{children}</main>
      <div className="pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))]">
        <SiteFooter locale={locale} />
      </div>
      <BottomNav />
      <Disclaimer />
      <VisitTracker />
    </div>
  )
}
