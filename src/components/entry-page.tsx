import Link from "next/link"
import { Plus } from "lucide-react"
import { DATA, PASSPORTS } from "@/lib/data"
import { arrivalsThrough, roadsFrom } from "@/lib/entries"
import { formatDate, formatHours } from "@/lib/format"
import { getI18n } from "@/lib/i18n"
import { getPublishedReports } from "@/lib/reports"
import type { Entry } from "@/lib/types"
import { PageHeader } from "@/components/page-header"
import { Section } from "@/components/section"
import { StatusStamp } from "@/components/status-stamp"
import { CountryTag } from "@/components/country-tag"
import { Provenance } from "@/components/provenance"
import { SyriaMap } from "@/components/syria-map"
import { ArrivalRow } from "@/components/arrival-row"
import { NeedsList } from "@/components/needs-list"
import { ReportList } from "@/components/report-list"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

/** One entry point, airport or land crossing: its status, who arrives through it, how far the cities
 *  are, what you need, and what travellers reported there. Both /flights/[id] and /crossings/[id] render this. */
export async function EntryPage({ id, entry: e }: { id: string; entry: Entry }) {
  const { locale, m } = await getI18n()
  const arrivals = arrivalsThrough(DATA.arrivals, id)
  const roads = roadsFrom(DATA.roads, DATA.cities, id)
  const reports = (await getPublishedReports()).filter((r) => r.entry === id)
  const nearest = roads[0]?.city.id ?? "damascus"
  const back = e.kind === "air" ? { href: "/flights", label: m.entry.allAirports } : { href: "/crossings", label: m.entry.allCrossings }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        back={back}
        eyebrow={
          <span className="inline-flex items-center gap-2">
            {m.kind[e.kind]}
            <CountryTag code={e.country ?? id} />
          </span>
        }
        title={e.name[locale]}
      >
        <div className="flex flex-wrap items-center gap-3">
          <StatusStamp status={e.status} label={m.status[e.status]} />
          <span className="text-xs text-muted-foreground">
            {m.checked} {formatDate(e.seen, locale)}
          </span>
        </div>
        {e.note && <p className="mt-3 max-w-prose text-[14.5px] leading-relaxed">{e.note[locale]}</p>}
        <Provenance source={e.source} locale={locale} m={m} />
      </PageHeader>

      <SyriaMap dest={nearest} liveEntries={[id]} locale={locale} />

      <Section id="through" title={m.entry.through}>
        {arrivals.length === 0 ? (
          <p className="text-sm text-muted-foreground">{m.entry.throughEmpty}</p>
        ) : (
          <ul className="divide-y rounded-2xl border bg-card px-5">
            {arrivals.map((a, i) => (
              <ArrivalRow key={i} a={a} locale={locale} m={m} show="carrier" />
            ))}
          </ul>
        )}
      </Section>

      <Section id="roads" title={m.entry.roads} aside={m.entry.roadsNote}>
        <ul className="grid grid-cols-2 gap-x-6 rounded-2xl border bg-card px-5 py-2 sm:grid-cols-3">
          {roads.map(({ city, hours }) => (
            <li key={city.id} className="flex items-baseline justify-between gap-2 border-b py-2 text-sm last:border-0 sm:[&:nth-last-child(-n+3)]:border-0 [&:nth-last-child(-n+2)]:border-0">
              <Link href={`/?to=${city.id}`} className="truncate underline-offset-4 hover:underline">
                {city.name[locale]}
              </Link>
              <span className="shrink-0 text-muted-foreground">{formatHours(hours, locale)}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="needs" title={m.entry.needs} more={{ href: "/visa", label: m.nav.visa }}>
        <Tabs defaultValue="sy">
          <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl p-1">
            {PASSPORTS.map((p) => (
              <TabsTrigger key={p} value={p} className="h-9 rounded-lg text-[13px]">
                {m.passportShort[p]}
              </TabsTrigger>
            ))}
          </TabsList>
          {PASSPORTS.map((p) => (
            <TabsContent key={p} value={p} className="rounded-2xl border bg-card px-5 py-4">
              <NeedsList needs={DATA.needs[e.kind][p]} locale={locale} m={m} />
            </TabsContent>
          ))}
        </Tabs>
      </Section>

      <Section id="reports" title={m.entry.reports} more={{ href: `/reports?entry=${id}`, label: m.home.latestAll }}>
        <ReportList reports={reports.slice(0, 5)} locale={locale} m={m} linkEntry={false} empty={m.entry.reportsEmpty} />
        <Button asChild variant="secondary" className="mt-3 h-11 rounded-full px-5 shadow-none">
          <Link href={`/reports/new?entry=${id}`}>
            <Plus className="size-4" strokeWidth={2.4} aria-hidden="true" />
            {m.entry.addHere}
          </Link>
        </Button>
      </Section>
    </div>
  )
}
