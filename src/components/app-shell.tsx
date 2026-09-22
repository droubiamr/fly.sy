import Link from "next/link"
import { getI18n } from "@/lib/i18n"
import { DATA } from "@/lib/data"
import { formatDate } from "@/lib/format"
import { toggleLocale } from "@/app/actions"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"

export async function AppShell({ children }: { children: React.ReactNode }) {
  const { locale, m } = await getI18n()
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col">
      <header className="flex items-center justify-between px-5 pt-5 pb-1">
        {/* dir="ltr" because the wordmark is a Latin name and must never be
            reordered by the surrounding Arabic. Not a flex container, for the
            same reason: flex items follow the container's direction, which puts
            ".sy" before "fly". The 44px tap area is grown behind it instead. */}
        <Link
          href="/"
          dir="ltr"
          className="relative inline-block text-[22px] font-bold tracking-tight after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-['']"
        >
          fly<span className="text-primary">.sy</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
            {/* No separator before the date: the middot is the same glyph as ٠, the
                Arabic-Indic zero, so "· ٢٠" reads as "٢٠٠". */}
            {m.updated} {formatDate(DATA.meta.updated, locale)}
          </span>
          <form action={toggleLocale}>
            {/* The chip stays small; the tappable area is grown to 44px behind it. */}
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="relative h-8 px-2 text-xs after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-['']"
            >
              {m.lang}
            </Button>
          </form>
        </div>
      </header>
      <p className="px-5 pt-2 text-[13px] leading-relaxed text-muted-foreground">{m.indep}</p>
      <main className="flex-1 px-5 pb-28 pt-4">{children}</main>
      <BottomNav />
    </div>
  )
}
