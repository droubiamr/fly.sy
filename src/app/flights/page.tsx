import { DATA } from "@/lib/data"
import { arrivalsThrough, entriesOfKind } from "@/lib/entries"
import { getI18n } from "@/lib/i18n"
import { pageMetadata } from "@/lib/metadata"
import { PageHeader } from "@/components/page-header"
import { Section } from "@/components/section"
import { EntryList } from "@/components/entry-list"
import { ArrivalRow } from "@/components/arrival-row"
import { CountryTag } from "@/components/country-tag"
import { Provenance } from "@/components/provenance"

export const generateMetadata = () => pageMetadata((m) => ({ title: m.flights.title, description: m.flights.lede }))

export default async function FlightsPage() {
  const { locale, m } = await getI18n()
  const airports = entriesOfKind(DATA.entries, "air")
  const europe = DATA.arrivals.filter((a) => a.from === "eu" && a.mode === "air")
  const byAirline = new Map<string, typeof DATA.arrivals>()
  for (const a of DATA.arrivals) {
    if (!a.airline) continue
    byAirline.set(a.airline, [...(byAirline.get(a.airline) ?? []), a])
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={m.flights.title} lede={m.flights.lede} />

      <Section id="airports" title={m.flights.airports}>
        <EntryList entries={airports} locale={locale} m={m} />
      </Section>

      {airports.map(([id, e]) => {
        const rows = arrivalsThrough(DATA.arrivals, id).filter((a) => a.airline)
        return (
          <Section key={id} id={`routes-${id}`} title={`${m.flights.routesInto} ${e.name[locale]}`}>
            {rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">{m.entry.throughEmpty}</p>
            ) : (
              <ul className="divide-y rounded-2xl border bg-card px-5">
                {rows.map((a, i) => (
                  <ArrivalRow key={i} a={a} locale={locale} m={m} show="carrier" />
                ))}
              </ul>
            )}
          </Section>
        )
      })}

      {europe.length > 0 && (
        <Section id="europe" title={m.flights.europe}>
          <div className="rounded-2xl border bg-card px-5 py-4">
            {europe.map((a, i) => (
              <div key={i}>
                <p className="text-sm font-semibold">{a.city[locale]}</p>
                {a.note && <p className="mt-1.5 text-[13.5px] leading-relaxed">{a.note[locale]}</p>}
                <Provenance confidence={a.confidence} source={a.source} seen={a.seen} locale={locale} m={m} />
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section id="carriers" title={m.flights.carriers}>
        <ul className="divide-y rounded-2xl border bg-card">
          {Object.entries(DATA.airlines).map(([code, al]) => {
            const hops = byAirline.get(code) ?? []
            const live = hops.some((h) => h.status === "open")
            return (
              <li key={code}>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-3 transition-colors duration-100 ease-out active:bg-muted [&::-webkit-details-marker]:hidden">
                    <span
                      className={
                        "grid size-10 shrink-0 place-items-center rounded-[10px] text-sm font-bold tracking-wide " +
                        (live ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground")
                      }
                    >
                      {code}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 font-semibold">
                        <CountryTag code={al.country} />
                        <span className="truncate">{al.name[locale]}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">
                        {hops.length ? hops.map((h) => h.city[locale]).join(" · ") : m.flights.carrierEmpty}
                      </span>
                    </span>
                  </summary>
                  {hops.length > 0 && (
                    <ul className="border-t px-5 ps-[calc(1.25rem+2.5rem+0.75rem)]">
                      {hops.map((h, i) => (
                        <ArrivalRow key={i} a={h} locale={locale} m={m} show="entry" />
                      ))}
                    </ul>
                  )}
                </details>
              </li>
            )
          })}
        </ul>
      </Section>
    </div>
  )
}
