import Link from "next/link";
import { DATA, DESTINATIONS, ORIGINS, cityById, entryPath, routePath } from "@/lib/data";
import { fmt, getI18n } from "@/lib/i18n";
import { airportReach, plan, type Journey, type Reach } from "@/lib/plan";
import { localePath } from "@/lib/site";
import type { Locale, OriginDef, Passport } from "@/lib/types";
import type { Crumb } from "@/components/breadcrumbs";
import { CHIP, PageBody, PageHero, Section } from "@/components/page";
import { Planner } from "@/components/planner";
import { PassportProvider } from "@/components/passport-state";
import { PassportSwitch, RouteResults } from "@/components/route-results";
import { StatusDot } from "@/components/status-badge";
import { WorldMap } from "@/components/world-map";

export type PlanProps = { locale: Locale; origin: OriginDef; dest: string };

const ALL: Passport[] = ["sy", "voa", "res"];

export function journeysFor(origin: OriginDef, dest: string, passport: Passport) {
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
 *
 * Laid out as a Linkat page: the question sits in the green panel as the
 * hero's one input, and the answer follows on the page. On desktop the map
 * stays in view beside the routes; below that the two stack.
 */
export function PlanView({
  locale,
  origin,
  dest,
  title,
  lede,
  crumbs,
  size,
}: PlanProps & { title: React.ReactNode; lede?: React.ReactNode; crumbs?: Crumb[]; size?: "home" | "page" }) {
  const { m } = getI18n(locale);
  const journeys = Object.fromEntries(ALL.map((p) => [p, journeysFor(origin, dest, p)])) as Record<Passport, Journey[]>;
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
  const href = (p: string) => localePath(locale, p);

  return (
    <PassportProvider>
      <PageHero locale={locale} crumbs={crumbs} title={title} lede={lede} size={size}>
        <Planner from={origin.id} dest={dest} reach={reach} />
      </PageHero>

      <PageBody>
        <div className="grid gap-10 xl:grid-cols-2 xl:items-start">
          {/* The map stays beside the routes on desktop, under the sticky header. */}
          <div className="xl:sticky xl:top-24">
            <WorldMap origin={origin} dest={dest} liveEntries={liveEntries} locale={locale} />
          </div>

          <Section id="routes-h" title={m.routes} note={m.estimates}>
            {/* The passport changes the answer, so the switch sits on the answer:
                one tap compares all three without scrolling back up. */}
            <PassportSwitch label={m.route.passports} className="mb-4" />
            <RouteResults journeys={journeys} dest={dest} locale={locale} m={m} />
          </Section>
        </div>

        {liveEntries.length > 0 && (
          <Section id="en-h" title={m.route.entries}>
            <ul className="flex flex-wrap gap-2">
              {[...new Set(liveEntries)].map((id) => (
                <li key={id}>
                  <Link href={href(entryPath(id))} className={CHIP}>
                    <StatusDot status={DATA.entries[id].status} />
                    {DATA.entries[id].name[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <div className="grid gap-14 md:grid-cols-2 md:gap-8">
          <Section id="od-h" title={fmt(m.route.otherDest, { origin: origin.name[locale] })}>
            <ul className="flex flex-wrap gap-2">
              {DESTINATIONS.filter((d) => d.id !== dest).map((d) => (
                <li key={d.id}>
                  <Link href={href(routePath(origin.id, d.id))} className={CHIP}>
                    {d.name[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="oo-h" title={fmt(m.route.otherOrigin, { city: city.name[locale] })}>
            <ul className="flex flex-wrap gap-2">
              {ORIGINS.filter((o) => o.id !== origin.id).map((o) => (
                <li key={o.id}>
                  <Link href={href(routePath(o.id, dest))} className={CHIP}>
                    {o.name[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </PageBody>
    </PassportProvider>
  );
}
