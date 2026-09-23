import { DATA } from "@/lib/data"
import { formatHours } from "@/lib/format"
import type { Arrival, Locale } from "@/lib/types"
import type { Messages } from "@/messages"
import { StatusDot } from "@/components/status-stamp"
import { CountryTag } from "@/components/country-tag"
import { Provenance } from "@/components/provenance"

/** One route into Syria as a list row: origin, carrier, entry point, hours, and its provenance line.
 *  `show` picks which side is the headline: the carrier on an airport page, the destination on an airline page. */
export function ArrivalRow({ a, locale, m, show }: { a: Arrival; locale: Locale; m: Messages; show: "carrier" | "entry" }) {
  const airline = a.airline ? DATA.airlines[a.airline] : null
  const entry = DATA.entries[a.entry]
  const head = show === "carrier" ? (airline ? airline.name[locale] : m.mode[a.mode]) : entry.name[locale]
  return (
    <li className="py-3">
      <div className="flex items-center gap-2.5">
        <StatusDot status={a.status} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <CountryTag code={a.country} />
            <span className="truncate">
              {a.city[locale]} <span className="font-normal text-muted-foreground">→ {head}</span>
            </span>
          </span>
        </span>
        <span className="shrink-0 text-[13px] text-muted-foreground">{formatHours(a.hours, locale)}</span>
      </div>
      {a.note && <p className="mt-1.5 ps-[18px] text-[13px] leading-relaxed">{a.note[locale]}</p>}
      <Provenance confidence={a.confidence} source={a.source} seen={a.seen} locale={locale} m={m} className="ps-[18px]" />
    </li>
  )
}
