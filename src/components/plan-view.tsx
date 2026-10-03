import Link from "next/link"
import { DATA, DESTINATIONS, ORIGINS, REGIONS, cityById, originSlug, routePath } from "@/lib/data"
import { fmt, getI18n } from "@/lib/i18n"
import { formatDate, formatHoursText } from "@/lib/format"
import { airportReach, answerFor, groupWays, plan, type Journey, type Reach } from "@/lib/plan"
import { localePath } from "@/lib/site"
import type { Locale, Mode, OriginDef, Passport } from "@/lib/types"
import { PassportProvider } from "@/components/passport-state"
import { AnswerLine, OnlyFor, PassportPlates } from "@/components/passport-ui"
import { PartnerCard } from "@/components/partner-card"
import { Planner } from "@/components/planner"
import { Provenance } from "@/components/provenance"
import { WaySigns } from "@/components/way-signs"
import { WorldMap } from "@/components/world-map"
import { Button } from "@/components/ui/button"

export type PlanProps = { locale: Locale; origin: OriginDef; dest: string }

const ALL: Passport[] = ["sy", "voa", "res"]

export function journeysFor(origin: OriginDef, dest: string, passport: Passport) {
  return plan({ arrivals: DATA.arrivals, entries: DATA.entries, roads: DATA.roads, from: origin, dest, passport })
}

/**
 * The sentence a route page opens with, for one passport. It is what a search
 * snippet or an AI assistant quotes, so it names the route, the time and the
 * check date in full words rather than leaning on the signs below it.
 */
export function answerText(locale: Locale, origin: OriginDef, dest: string, journeys: Journey[]) {
  const { m } = getI18n(locale)
  const { best, running, total } = answerFor(journeys)
  const vars = { origin: origin.name[locale], city: cityById(dest)!.name[locale], running, total }
  if (!best || best.totalHours == null) return fmt(m.route.answerNone, vars)
  return fmt(m.route.answer, {
    ...vars,
    how: fmt(m.route.how[best.mode], { entry: best.entryData.name[locale] }),
    hours: formatHoursText(best.totalHours, locale),
    date: formatDate(best.seen, locale),
  })
}

/**
 * The route page, as road signs. The map opens it; the question is a sign; each
 * way in is a sign of its own, fastest first, with a plane, a car or both. It is
 * rendered once, for a Syrian passport. What differs by passport (the answer
 * sentence, a Syrians-only crossing, the papers) rides along and is switched on
 * the phone from ?p=, so the passport costs no request and no extra page.
 */
export function PlanView({ locale, origin, dest, heading }: PlanProps & { heading: React.ReactNode }) {
  const { m } = getI18n(locale)
  const journeys = Object.fromEntries(ALL.map((p) => [p, journeysFor(origin, dest, p)])) as Record<Passport, Journey[]>
  const reach = Object.fromEntries(
    ALL.map((p) => [p, airportReach({ arrivals: DATA.arrivals, entries: DATA.entries, from: origin, passport: p })]),
  ) as Record<Passport, Record<string, Reach>>
  const answers = Object.fromEntries(ALL.map((p) => [p, answerText(locale, origin, dest, journeys[p])])) as Record<Passport, string>
  const ways = groupWays(journeys.sy, dest)
  // The papers follow the way a passport would actually take: the first one open to it.
  const needsMode = Object.fromEntries(
    ALL.map((p) => [p, groupWays(journeys[p], dest).find((w) => !w.blocked && w.best)?.mode ?? "air"]),
  ) as Record<Passport, Mode>
  const liveEntries = journeys.sy.filter((j) => !j.blocked && j.status !== "closed").map((j) => j.entry)
  const city = cityById(dest)!
  const href = (p: string) => localePath(locale, p)

  return (
    <PassportProvider>
      {/* The band: the map edge to edge on a phone; beside the question on a wide screen.
          Its background is the map's own sea, so the map has no frame. */}
      <section aria-label={m.routes} className="border-b bg-muted dark:bg-background">
        <div className="mx-auto grid max-w-6xl lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-center lg:gap-10 lg:px-6 lg:py-6">
          <div className="lg:order-2">
            <WorldMap origin={origin} dest={dest} liveEntries={liveEntries} locale={locale} framed={false} />
          </div>
          <div className="flex flex-col gap-3 px-5 py-4 lg:order-1 lg:px-0">
            <Planner
              from={origin.id}
              dest={dest}
              reach={reach}
              origins={ORIGINS.map((o) => ({ id: o.id, name: o.name, region: o.region, slug: originSlug(o.id) }))}
              destinations={DESTINATIONS.map((d) => ({ id: d.id, entry: d.entry, name: d.name }))}
              regions={REGIONS}
            />
            <PassportPlates />
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 pt-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-10 lg:px-6">
        <div className="flex min-w-0 flex-col gap-4">
          {heading}
          <AnswerLine answers={answers} />
          <WaySigns ways={ways} dest={dest} locale={locale} />
          <p className="text-xs text-muted-foreground">{m.estimates}</p>
        </div>

        <aside className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby="need-h" className="overflow-hidden rounded-[10px] border bg-card">
            <h2 id="need-h" className="bg-secondary px-4 py-2.5 text-[15px] font-bold text-secondary-foreground">
              {m.need}
            </h2>
            {ALL.map((p) => (
              <OnlyFor key={p} passport={p}>
                <p className="px-4 pt-3 text-xs font-semibold text-muted-foreground">
                  {m.reports.form.passports[p]} · {m.mode[needsMode[p]]}
                </p>
                <ul className="flex flex-col px-4 pb-2">
                  {DATA.needs[needsMode[p]][p].map((n, i) => (
                    <li key={i} className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-3 border-b py-3 text-[14px] leading-relaxed last:border-0">
                      <span className="mt-1 size-4 rounded-[4px] border-[1.5px] border-input" aria-hidden="true" />
                      <span>
                        {n.text[locale]}
                        <Provenance source={n.source} locale={locale} m={m} />
                      </span>
                    </li>
                  ))}
                </ul>
              </OnlyFor>
            ))}
          </section>
          <Button asChild className="h-12 w-full text-[15px]">
            <Link href={href("/documents")}>{m.footer.documents}</Link>
          </Button>
          <PartnerCard locale={locale} origin={origin} dest={dest} running={answerFor(journeys.sy).running > 0} />

          <nav aria-labelledby="od-h" className="flex flex-col gap-2">
            <h2 id="od-h" className="text-[15px] font-bold">
              {fmt(m.route.otherDest, { origin: origin.name[locale] })}
            </h2>
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[14px]">
              {DESTINATIONS.filter((d) => d.id !== dest).map((d) => (
                <li key={d.id}>
                  <Link href={href(routePath(origin.id, d.id))} className="text-primary underline-offset-4 hover:underline">
                    {d.name[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-labelledby="oo-h" className="flex flex-col gap-2">
            <h2 id="oo-h" className="text-[15px] font-bold">
              {fmt(m.route.otherOrigin, { city: city.name[locale] })}
            </h2>
            <ul className="grid grid-cols-3 gap-x-4 gap-y-1.5 text-[14px] sm:grid-cols-4">
              {ORIGINS.filter((o) => o.id !== origin.id).map((o) => (
                <li key={o.id} className="min-w-0 truncate">
                  <Link href={href(routePath(o.id, dest))} className="text-primary underline-offset-4 hover:underline">
                    {o.name[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </PassportProvider>
  )
}
