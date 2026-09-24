import Link from "next/link"
import { DATA } from "@/lib/data"
import { formatDate } from "@/lib/format"
import { getI18n } from "@/lib/i18n"
import { localePath } from "@/lib/site"
import { GITHUB_URL } from "@/lib/schema"
import type { Locale } from "@/lib/types"

/** The independence notice, the check date, and crawlable links to every section, so no page is more than one click from any other. */
export function SiteFooter({ locale }: { locale: Locale }) {
  const { m } = getI18n(locale)
  const links = [
    { href: "/", label: m.tabs.plan },
    { href: "/airlines", label: m.tabs.airlines },
    { href: "/crossings", label: m.tabs.crossings },
    { href: "/documents", label: m.footer.documents },
    { href: "/reports", label: m.tabs.reports },
  ]
  const link = "inline-flex min-h-11 items-center underline-offset-4 hover:underline"
  return (
    <footer className="mt-6 flex flex-col gap-4 border-t-[1.5px] px-5 pt-5 pb-4 text-base leading-relaxed text-muted-foreground">
      {/* The notice used to sit under the header on every page. It matters, but
          it is not the first thing a visitor came to read. */}
      <p>{m.indep}</p>
      <p>
        {m.updated}: <time dateTime={DATA.meta.updated}>{formatDate(DATA.meta.updated, locale)}</time>
      </p>
      <Link href={localePath(locale, "/about")} className="inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4">
        {m.about.title}
      </Link>
      <p className="mt-2 text-[15px] font-semibold uppercase tracking-wide">{m.footer.explore}</p>
      <ul className="-mt-2 flex flex-wrap gap-x-5 gap-y-0">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={localePath(locale, l.href)} className={link}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <ul className="flex flex-wrap gap-x-5 gap-y-0 text-[15px]">
        <li>
          <a href={GITHUB_URL} rel="noopener" className={link}>
            {m.footer.code}
          </a>
        </li>
        <li>
          <a href={`${GITHUB_URL}/blob/main/data/LICENSE`} rel="noopener license" className={link}>
            {m.footer.data}
          </a>
        </li>
      </ul>
      <p className="text-[15px] leading-relaxed">{m.footer.disclaimer}</p>
    </footer>
  )
}
