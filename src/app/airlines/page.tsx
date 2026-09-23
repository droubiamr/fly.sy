import type { Metadata } from "next"
import { DATA } from "@/lib/data"
import { getI18n } from "@/lib/i18n"
import { formatDate, formatHours } from "@/lib/format"
import { StatusDot, StatusStamp } from "@/components/status-stamp"
import { CountryTag } from "@/components/country-tag"
import { AirlineLogo } from "@/components/airline-logo"

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n()
  return { title: m.airlines.title }
}

export default async function AirlinesPage() {
  const { locale, m } = await getI18n()
  const byAirline = new Map<string, typeof DATA.arrivals>()
  for (const a of DATA.arrivals) {
    if (!a.airline) continue
    byAirline.set(a.airline, [...(byAirline.get(a.airline) ?? []), a])
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold tracking-tight">{m.airlines.title}</h1>
      {/* minmax(0,1fr) columns: a no-wrap city list must truncate, not widen the track. */}
      <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {Object.entries(DATA.airlines).map(([code, al]) => {
          const hops = byAirline.get(code) ?? []
          // What the carrier is doing now, for the stamp beside its name: flying if any
          // route is open; otherwise closed only when every route is, else unknown.
          const state = hops.some((h) => h.status === "open") ? "open" : hops.every((h) => h.status === "closed") ? "closed" : "unknown"
          return (
            <li key={code}>
              <details className="group rounded-2xl border bg-card">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                  {/* Carriers with nothing flying stay listed, in colour, with a stamp
                      that says so: the list is also a record of who used to fly, and a
                      greyed logo reads as a broken image rather than a status. */}
                  <span className="size-10 shrink-0 rounded-[10px] border bg-background p-1.5">
                    <AirlineLogo code={code} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 font-semibold">
                      <CountryTag code={al.country} />
                      <span className="truncate">{al.name[locale]}</span>
                      {state !== "open" && <StatusStamp status={state} label={m.status[state]} />}
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">
                      {hops.length ? hops.map((h) => h.city[locale]).join(" · ") : m.airlines.empty}
                    </span>
                  </span>
                </summary>
                {hops.length > 0 && (
                  <ul className="border-t px-4 pb-2">
                    {hops.map((h, i) => (
                      <li key={i} className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b py-2.5 text-sm last:border-0">
                        <StatusDot status={h.status} />
                        <span>{h.city[locale]}</span>
                        <span className="text-xs text-muted-foreground">→</span>
                        <span>{DATA.entries[h.entry].name[locale]}</span>
                        <span className="ms-auto text-[13px] text-muted-foreground">{formatHours(h.hours, locale)}</span>
                        <span className="w-full ps-4 text-xs text-muted-foreground">
                          {m.confidence[h.confidence]} · {DATA.sources[h.source].name[locale]} · {m.checked}{" "}
                          {formatDate(h.seen, locale)}
                          {h.note && ` — ${h.note[locale]}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </details>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
