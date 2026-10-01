import Link from "next/link"
import { getI18n } from "@/lib/i18n"
import { localePath } from "@/lib/site"
import type { Locale } from "@/lib/types"
import { LangSwitch } from "@/components/lang-switch"
import { MainNav } from "@/components/main-nav"
import { SiteSearch } from "@/components/site-search"

/** A solid bar: the logo, the sections on a wide screen, search and the other language. */
export function SiteHeader({ locale }: { locale: Locale }) {
  const { m } = getI18n(locale)
  return (
    <header className="sticky top-0 z-30 border-b bg-card pt-[env(safe-area-inset-top,0px)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 lg:gap-6 lg:px-6">
        {/* dir="ltr" because the wordmark is a Latin name and must never be
            reordered by the surrounding Arabic. Not a flex container, for the
            same reason: flex items follow the container's direction, which puts
            ".sy" before "fly". The 44px tap area is grown behind it instead. */}
        <Link
          href={localePath(locale, "/")}
          dir="ltr"
          aria-label={m.meta.title}
          className="relative inline-block text-[21px] font-bold tracking-tight after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-['']"
        >
          fly<span className="text-primary">.sy</span>
        </Link>
        <MainNav variant="top" />
        <span className="flex-1" />
        <SiteSearch />
        <LangSwitch />
      </div>
    </header>
  )
}
