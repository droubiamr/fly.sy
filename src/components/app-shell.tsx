import Link from "next/link"
import { CalendarCheck, Globe } from "lucide-react"
import { getI18n } from "@/lib/i18n"
import { DATA } from "@/lib/data"
import { formatDate } from "@/lib/format"
import { toggleLocale } from "@/app/actions"
import { BottomNav } from "@/components/bottom-nav"
import { HeaderNav } from "@/components/header-nav"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"

export async function AppShell({ children }: { children: React.ReactNode }) {
  const { locale, m } = await getI18n()
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col">
      {/* A floating pill rather than a bar: the page runs edge to edge underneath
          it and shows through, so the chrome reads as a layer above the content
          instead of a strip carved out of it. Sticks below the notch, not under
          it — with top:0 it would sit in the safe area on a phone. */}
      <header className="sticky top-[env(safe-area-inset-top,0px)] z-30 px-5 pt-4 pb-2">
        <div
          className="flex items-center gap-2 rounded-full border border-border/70 bg-card/72 p-1 ps-4
                     backdrop-blur-lg backdrop-saturate-150"
        >
          {/* dir="ltr" because the wordmark is a Latin name and must never be
              reordered by the surrounding Arabic. Not a flex container, for the
              same reason: flex items follow the container's direction, which puts
              ".sy" before "fly". The 44px tap area is grown behind it instead. */}
          <Link
            href="/"
            dir="ltr"
            className="relative inline-block text-[19px] font-bold tracking-tight after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-['']"
          >
            fly<span className="text-primary">.sy</span>
          </Link>

          {/* On a phone the sections live in the dock at the bottom of the screen.
              From tablet width up there is room for them here, and a dock floating
              in the middle of a wide screen would look like a stray widget. */}
          <HeaderNav />

          {/* Icon first, and the label lives in aria-label: "آخر تحديث ٢٠ أيلول"
              would crowd the pill, and the calendar already says what the date is. */}
          <span
            className="ms-auto inline-flex items-center gap-1.5 text-[11.5px] font-medium tracking-wide text-foreground/75"
            aria-label={`${m.updated} ${formatDate(DATA.meta.updated, locale)}`}
          >
            <CalendarCheck className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span aria-hidden="true">{formatDate(DATA.meta.updated, locale)}</span>
          </span>

          <form action={toggleLocale}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="h-11 gap-1.5 rounded-full px-3.5 text-[11.5px] font-medium tracking-wide"
            >
              <Globe className="size-3.5 shrink-0" aria-hidden="true" />
              {m.lang}
            </Button>
          </form>
        </div>
      </header>

      <main className="flex-1 px-5 pt-4 pb-8">{children}</main>
      <SiteFooter />
      <BottomNav />
    </div>
  )
}
