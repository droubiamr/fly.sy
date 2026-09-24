import Link from "next/link"
import { getI18n } from "@/lib/i18n"
import { localePath } from "@/lib/site"
import { GITHUB_URL } from "@/lib/schema"
import type { Locale } from "@/lib/types"

/** Crawlable links to every section, so no page is more than one click from any other. */
export function SiteFooter({ locale }: { locale: Locale }) {
  const { m } = getI18n(locale)
  const links = [
    { href: "/", label: m.tabs.plan },
    { href: "/airlines", label: m.tabs.airlines },
    { href: "/crossings", label: m.tabs.crossings },
    { href: "/documents", label: m.footer.documents },
    { href: "/reports", label: m.tabs.reports },
    { href: "/about", label: m.tabs.about },
  ]
  return (
    <footer className="mt-10 border-t px-5 pb-6 pt-6 text-[13px] text-muted-foreground">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide">{m.footer.explore}</p>
      <ul className="flex flex-wrap gap-x-4 gap-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={localePath(locale, l.href)} className="underline-offset-4 hover:underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        <li>
          <a href={GITHUB_URL} rel="noopener" className="underline-offset-4 hover:underline">
            {m.footer.code}
          </a>
        </li>
        <li>
          <a href={`${GITHUB_URL}/blob/main/data/LICENSE`} rel="noopener license" className="underline-offset-4 hover:underline">
            {m.footer.data}
          </a>
        </li>
      </ul>
      <p className="mt-4 text-xs leading-relaxed">{m.footer.disclaimer}</p>
    </footer>
  )
}
