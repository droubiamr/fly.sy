import { DATA, DESTINATIONS, ORIGINS, PASSPORTS, originById } from "@/lib/data"
import { getI18n } from "@/lib/i18n"
import { plan } from "@/lib/plan"
import type { Passport } from "@/lib/types"
import { Planner } from "@/components/planner"
import { WorldMap } from "@/components/world-map"
import { RouteCard } from "@/components/route-card"

type Search = { from?: string; to?: string; p?: string }

const pick = <T extends string>(v: string | undefined, allowed: readonly T[], fallback: T): T =>
  allowed.includes(v as T) ? (v as T) : fallback

export default async function PlanPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams
  const { locale, m } = await getI18n()

  // Türkiye by default: it hosts the most Syrians abroad. Old links carry region ids; originById maps them.
  const origin = originById(sp.from) ?? originById("TR") ?? ORIGINS[0]
  // Only cities with an airport are offered, by airport name; an old link to any other city lands on Damascus.
  const dest = pick(sp.to, DESTINATIONS.map((c) => c.id), "damascus")
  const passport = pick(sp.p, PASSPORTS.map((p) => p.id), "sy" as Passport)

  const journeys = plan({ arrivals: DATA.arrivals, entries: DATA.entries, roads: DATA.roads, from: origin, dest, passport })
  const liveEntries = journeys.filter((j) => !j.blocked).map((j) => j.entry)

  return (
    <div className="flex flex-col gap-5">
      <h1 className="sr-only">fly.sy</h1>
      <Planner from={origin.id} dest={dest} passport={passport} />

      <WorldMap origin={origin} dest={dest} liveEntries={liveEntries} locale={locale} />

      <section aria-labelledby="routes-h">
        <div className="mb-2.5 flex items-baseline justify-between">
          <h2 id="routes-h" className="text-[15px] font-semibold">
            {m.routes}
          </h2>
          <span className="text-xs text-muted-foreground">{m.estimates}</span>
        </div>

        {journeys.length === 0 ? (
          <p className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">{m.routesEmpty}</p>
        ) : (
          <ol className="flex flex-col gap-2.5">
            {journeys.map((j, i) => (
              <li key={`${j.entry}-${j.airline ?? j.city.en}-${i}`}>
                <RouteCard journey={j} dest={dest} passport={passport} rank={i + 1} locale={locale} m={m} />
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}
