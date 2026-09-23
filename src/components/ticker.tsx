import { DATA } from "@/lib/data"
import { formatDate } from "@/lib/format"
import { getI18n } from "@/lib/i18n"
import type { Locale } from "@/lib/types"

/**
 * Linkat's strip of phrases sliding along the very top, carrying fly.sy's
 * live answer instead of slogans: every airport and crossing with its status,
 * and the date of the last check. The page's colours inverted, so it is a
 * green strip on the light page and a light one on the dark page.
 *
 * Decorative and hidden from screen readers: the same statuses are on the
 * crossings page, and read out twice they would say nothing new.
 */
export function Ticker({ locale }: { locale: Locale }) {
  const { m } = getI18n(locale)
  const items = [
    `${m.updated} ${formatDate(DATA.meta.updated, locale)}`,
    ...Object.values(DATA.entries).map((e) => `${e.name[locale]} · ${m.status[e.status]}`),
  ]
  return (
    <div className="ticker bg-foreground py-2.5 text-[13px] font-medium text-background" aria-hidden="true">
      <div className="ticker-track">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0">
            {items.map((item) => (
              <li key={item} className="flex items-center whitespace-nowrap pe-6">
                {item}
                <span className="ps-6 text-background/40">•</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}
