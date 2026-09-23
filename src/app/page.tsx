import { DATA, ORIGINS, PASSPORTS } from "@/lib/data"
import { getI18n } from "@/lib/i18n"
import { pageMetadata } from "@/lib/metadata"
import { plan } from "@/lib/plan"
import { getPublishedReports } from "@/lib/reports"
import type { Origin, Passport } from "@/lib/types"
import { PageHeader } from "@/components/page-header"
import { Section } from "@/components/section"
import { Planner } from "@/components/planner"
import { SyriaMap } from "@/components/syria-map"
import { RouteCard } from "@/components/route-card"
import { EntryList } from "@/components/entry-list"
import { ReportList } from "@/components/report-list"

type Search = { from?: string; to?: string; p?: string }

const pick = <T extends string>(v: string | undefined, allowed: readonly T[], fallback: T): T =>
  allowed.includes(v as T) ? (v as T) : fallback

export const generateMetadata = () => pageMetadata((m) => ({ title: m.home.title, description: m.home.lede }))

export default async function PlanPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams
  const { locale, m } = await getI18n()

  const from = pick(sp.from, ORIGINS.map((o) => o.id), "tr" as Origin)
  const dest = pick(sp.to, DATA.cities.map((c) => c.id), "damascus")
  const passport = pick(sp.p, PASSPORTS, "sy" as Passport)

  const journeys = plan({ arrivals: DATA.arrivals, entries: DATA.entries, roads: DATA.roads, from, dest, passport })
  const liveEntries = journeys.filter((j) => !j.blocked).map((j) => j.entry)
  const latest = (await getPublishedReports()).slice(0, 3)

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={m.home.title} lede={m.home.lede} />

      <div className="flex flex-col gap-5">
        <Planner from={from} dest={dest} passport={passport} />
        <SyriaMap dest={dest} liveEntries={liveEntries} locale={locale} />
      </div>

      <Section id="routes-h" title={m.home.routes} aside={m.home.estimates}>
        {journeys.length === 0 ? (
          <p className="rounded-2xl border border-dashed px-5 py-6 text-center text-sm text-muted-foreground">{m.home.routesEmpty}</p>
        ) : (
          <ol className="flex flex-col gap-2.5">
            {journeys.map((j, i) => (
              <li key={`${j.entry}-${j.airline ?? j.city.en}-${i}`}>
                <RouteCard journey={j} dest={dest} passport={passport} rank={i + 1} locale={locale} m={m} />
              </li>
            ))}
          </ol>
        )}
      </Section>

      <Section id="board-h" title={m.home.board} more={{ href: "/crossings", label: m.home.boardAll }}>
        <EntryList entries={Object.entries(DATA.entries)} locale={locale} m={m} />
      </Section>

      <Section id="latest-h" title={m.home.latest} more={{ href: "/reports", label: m.home.latestAll }}>
        <ReportList reports={latest} locale={locale} m={m} empty={m.reports.empty} />
      </Section>
    </div>
  )
}
