import Link from "next/link"
import { DATA, DESTINATIONS, ORIGINS, cityById, entryPath, routePath } from "@/lib/data"
import { fmt, getI18n } from "@/lib/i18n"
import { airportReach, plan, type Journey, type Reach } from "@/lib/plan"
import { localePath } from "@/lib/site"
import type { Locale, OriginDef, Passport } from "@/lib/types"
import { Planner } from "@/components/planner"
import { PassportProvider } from "@/components/passport-state"
import { PassportChips, RouteResults } from "@/components/route-results"
import { WorldMap } from "@/components/world-map"

export type PlanProps = { locale: Locale; origin: OriginDef; dest: string }

const ALL: Passport[] = ["sy", "voa", "res"]

export function journeysFor(origin: OriginDef, dest: string, passport: Passport) {
  return plan({ arrivals: DATA.arrivals, entries: DATA.entries, roads: DATA.roads, from: origin, dest, passport })
}

/**
 * The three questions, the ranked routes, then the map. Shared by the home page
 * and every /from/…/to/… page. Rendered once, for a Syrian passport; the answers
 * for the other passports ride along and are swapped in on the client from ?p=.
 */
export function PlanView({ locale, origin, dest, heading }: PlanProps & { heading: React.ReactNode }) {
  const { m } = getI18n(locale)
  const journeys = Object.fromEntries(ALL.map((p) => [p, journeysFor(origin, dest, p)])) as Record<Passport, Journey[]>
  const reach = Object.fromEntries(
    ALL.map((p) => [p, airportReach({ arrivals: DATA.arrivals, entries: DATA.entries, from: origin, passport: p })]),
  ) as Record<Passport, Record<string, Reach>>
  const liveEntries = journeys.sy.filter((j) => !j.blocked).map((j) => j.entry)
  const city = cityById(dest)!
  const href = (p: string) => localePath(locale, p)
  const chip = "inline-flex min-h-12 items-center gap-1.5 rounded-xl border-[1.5px] border-input bg-card px-4 text-base font-semibold"

  return (
    <PassportProvider>
      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-5">
          {heading}
          <Planner from={origin.id} dest={dest} reach={reach} />
        </section>

        {/* The answer, then the picture of it. The map used to sit between the
            question and the routes and pushed the first route off the screen. */}
        <section id="routes" aria-labelledby="routes-h" className="flex scroll-mt-4 flex-col gap-4">
          <h2 id="routes-h" className="text-2xl font-bold tracking-tight">
            {m.routes}
          </h2>
          <RouteResults journeys={journeys} dest={dest} originName={origin.name[locale]} cityName={city.name[locale]} locale={locale} m={m} />
        </section>

        <section aria-label={m.map} className="flex flex-col gap-3">
          <h2 className="text-xl font-bold tracking-tight">{m.map}</h2>
          <WorldMap origin={origin} dest={dest} liveEntries={liveEntries} locale={locale} />
        </section>

        <section aria-labelledby="pp-h" className="rounded-2xl border-[1.5px] bg-card px-4 py-4">
          <h2 id="pp-h" className="text-xl font-bold">
            {m.route.passports}
          </h2>
          <PassportChips locale={locale} />
        </section>

        {liveEntries.length > 0 && (
          <section aria-labelledby="en-h">
            <h2 id="en-h" className="mb-3 text-xl font-bold">
              {m.route.entries}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {[...new Set(liveEntries)].map((id) => (
                <li key={id}>
                  <Link href={href(entryPath(id))} className={chip}>
                    {DATA.entries[id].name[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="od-h">
          <h2 id="od-h" className="mb-3 text-xl font-bold">
            {fmt(m.route.otherDest, { origin: origin.name[locale] })}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {DESTINATIONS.filter((d) => d.id !== dest).map((d) => (
              <li key={d.id}>
                <Link href={href(routePath(origin.id, d.id))} className={chip}>
                  {d.name[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="oo-h">
          <h2 id="oo-h" className="mb-3 text-xl font-bold">
            {fmt(m.route.otherOrigin, { city: city.name[locale] })}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {ORIGINS.filter((o) => o.id !== origin.id).map((o) => (
              <li key={o.id}>
                <Link href={href(routePath(o.id, dest))} className={chip}>
                  {o.name[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PassportProvider>
  )
}
