import type { Locale } from "@/lib/types"
import { Disclaimer } from "@/components/disclaimer"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { VisitTracker } from "@/components/visit-tracker"

export function AppShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader locale={locale} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pt-5">{children}</main>
      {/* Room under the footer for the phone's tab bar, which is fixed to the bottom. */}
      <div className="pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
        <SiteFooter locale={locale} />
      </div>
      <MainNav variant="bar" />
      <Disclaimer />
      <VisitTracker />
    </div>
  )
}
