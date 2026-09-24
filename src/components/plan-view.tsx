import Link from "next/link";
import {
  DATA,
  DESTINATIONS,
  ORIGINS,
  cityById,
  entryPath,
  routePath,
} from "@/lib/data";
import { fmt, getI18n } from "@/lib/i18n";
import { formatHours } from "@/lib/format";
import { airportReach, plan, type Journey, type Reach } from "@/lib/plan";
import { localePath } from "@/lib/site";
import type { Locale, OriginDef, Passport } from "@/lib/types";
import { Planner } from "@/components/planner";
import { PassportProvider } from "@/components/passport-state";
import { PassportChips, RouteResults } from "@/components/route-results";
import { WorldMap } from "@/components/world-map";

export type PlanProps = { locale: Locale; origin: OriginDef; dest: string };

const ALL: Passport[] = ["sy", "voa", "res"];

export function journeysFor(
  origin: OriginDef,
  dest: string,
  passport: Passport,
) {
  return plan({
    arrivals: DATA.arrivals,
    entries: DATA.entries,
    roads: DATA.roads,
    from: origin,
    dest,
    passport,
  });
}

/**
 * The planner, the map and the ranked routes. Shared by the home page and every
 * /from/…/to/… page. Rendered once, for a Syrian passport; the answers for the
 * other passports ride along and are swapped in on the client from ?p=.
 */
export function PlanView({
  locale,
  origin,
  dest,
  heading,
}: PlanProps & { heading: React.ReactNode }) {
  const { m } = getI18n(locale);
  const journeys = Object.fromEntries(
    ALL.map((p) => [p, journeysFor(origin, dest, p)]),
  ) as Record<Passport, Journey[]>;
  const reach = Object.fromEntries(
    ALL.map((p) => [
      p,
      airportReach({
        arrivals: DATA.arrivals,
        entries: DATA.entries,
        from: origin,
        passport: p,
      }),
    ]),
  ) as Record<Passport, Record<string, Reach>>;
  const live = journeys.sy.filter((j) => !j.blocked);
  const liveEntries = live.map((j) => j.entry);
  const city = cityById(dest)!;
  const best = live.find((j) => j.totalHours != null);
  const href = (p: string) => localePath(locale, p);
  const chip =
    "inline-flex min-h-11 items-center gap-1.5 rounded-full border bg-card px-4 text-sm";

  return (
    <PassportProvider>
      <div className="flex flex-col gap-5">
        {heading}
        <Planner from={origin.id} dest={dest} reach={reach} />

        {best && (
          <p className="text-sm text-muted-foreground">
            {fmt(m.route.fastest, {
              mode: m.mode[best.mode],
              entry: best.entryData.name[locale],
              hours: formatHours(best.totalHours, locale),
            })}
          </p>
        )}

        <WorldMap
          origin={origin}
          dest={dest}
          liveEntries={liveEntries}
          locale={locale}
        />

        <section aria-labelledby="routes-h">
          <div className="mb-2.5 flex items-baseline justify-between">
            <h2 id="routes-h" className="text-[15px] font-semibold">
              {m.routes}
            </h2>
            <span className="text-xs text-muted-foreground">{m.estimates}</span>
          </div>
          <RouteResults journeys={journeys} dest={dest} locale={locale} m={m} />
        </section>

        <section
          aria-labelledby="pp-h"
          className="rounded-2xl border bg-card px-5 py-4"
        >
          <h2 id="pp-h" className="text-[15px] font-semibold">
            {m.route.passports}
          </h2>
          <PassportChips locale={locale} />
        </section>

        {liveEntries.length > 0 && (
          <section aria-labelledby="en-h">
            <h2 id="en-h" className="mb-2 text-[15px] font-semibold">
              {m.route.entries}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {[...new Set(liveEntries)].map((id) => (
                <li key={id}>
                  <Link
                    href={href(entryPath(id))}
                    className={chip + " font-medium"}
                  >
                    {DATA.entries[id].name[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="od-h">
          <h2 id="od-h" className="mb-2 text-[15px] font-semibold">
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
          <h2 id="oo-h" className="mb-2 text-[15px] font-semibold">
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
  );
}
