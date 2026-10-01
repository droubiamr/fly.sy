import Link from "next/link"
import { CalendarCheck } from "lucide-react"
import { DATA } from "@/lib/data"
import { getI18n } from "@/lib/i18n"
import { formatDate } from "@/lib/format"
import { localePath } from "@/lib/site"
import type { Locale } from "@/lib/types"

/** Who we are, when the facts were last reviewed, and crawlable links to every section. */
export function SiteFooter({ locale }: { locale: Locale }) {
  const { m } = getI18n(locale)
  const links = [
    { href: "/", label: m.tabs.plan },
    { href: "/airlines", label: m.tabs.airlines },
    { href: "/crossings", label: m.tabs.crossings },
    { href: "/documents", label: m.footer.documents },
    { href: "/news", label: m.tabs.news },
    { href: "/reports", label: m.tabs.reports },
    { href: "/about", label: m.tabs.about },
  ]
  return (
    <footer className="mt-12 border-t bg-card">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 text-sm text-muted-foreground lg:grid-cols-[1.4fr_1fr] lg:px-6">
        <div className="flex flex-col gap-3">
          <p dir="ltr" className="self-start text-lg font-bold tracking-tight text-foreground">
            fly<span className="text-primary">.sy</span>
          </p>
          <p className="max-w-prose leading-relaxed">{m.indep}</p>
          <p className="inline-flex items-center gap-2 font-medium text-foreground">
            <CalendarCheck className="size-4 text-primary" aria-hidden="true" />
            {m.updated} <time dateTime={DATA.meta.updated}>{formatDate(DATA.meta.updated, locale)}</time>
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold tracking-wide uppercase">{m.footer.explore}</p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={localePath(locale, l.href)} className="text-foreground underline-offset-4 hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-xs leading-relaxed">{m.footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  )
}
