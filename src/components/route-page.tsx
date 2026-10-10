import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { DATA, DESTINATIONS, ORIGINS, airlinePath, cityById, destinationById, entryPath, leavePath, originFromSlug, originSlug, routePath } from "@/lib/data"
import { fmt, getI18n, requireLocale } from "@/lib/i18n"
import { arrow, formatHours } from "@/lib/format"
import { answerFor } from "@/lib/plan"
import { pageMetadata } from "@/lib/seo"
import { breadcrumbLd, graph, routeListLd, webPageLd } from "@/lib/schema"
import type { Direction, Locale, OriginDef } from "@/lib/types"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { JsonLd } from "@/components/json-ld"
import { PlanView, answerText, journeysFor } from "@/components/plan-view"

/** The two segments of /from/[origin]/to/[city]. Into Syria they are a country slug and a city id; out of it, a
 *  city id and a country slug (/from/damascus/to/turkiye). The two kinds of name never collide. */
export type RouteParams = { lang: Locale; origin: string; city: string }

/** Every country × airport city, both ways. Unknown slugs 404. The passport is a query on the page, not a segment. */
export function routeParams() {
  const out: Omit<RouteParams, "lang">[] = []
  for (const o of ORIGINS) for (const d of DESTINATIONS) out.push({ origin: originSlug(o.id), city: d.id })
  for (const d of DESTINATIONS) for (const o of ORIGINS) out.push({ origin: d.id, city: originSlug(o.id) })
  return out
}

function resolve(p: RouteParams): { country: OriginDef; city: string; dir: Direction; path: string } {
  const into = originFromSlug(p.origin)
  const dest = destinationById(p.city)?.id
  if (into && dest) return { country: into, city: dest, dir: "in", path: routePath(into.id, dest) }
  const from = destinationById(p.origin)?.id
  const to = originFromSlug(p.city)
  if (from && to) return { country: to, city: from, dir: "out", path: leavePath(from, to.id) }
  notFound()
}

export function routeMetadata(p: RouteParams): Metadata {
  const { country, city, dir, path } = resolve(p)
  const { locale, m } = getI18n(requireLocale(p.lang))
  const vars = { origin: country.name[locale], country: country.name[locale], city: cityById(city)!.name[locale] }
  // The same pick as the sentence the page opens with: the fastest route that is running.
  const { best, running } = answerFor(journeysFor(country, city, "sy", dir))
  if (dir === "out") {
    const description = best
      ? fmt(m.seo.routeOut.description, {
          ...vars,
          how: fmt(m.routeOut.how[best.mode], { entry: best.entryData.name[locale] }),
          hours: formatHours(best.totalHours, locale),
        })
      : fmt(m.seo.routeOut.descriptionNone, vars)
    return pageMetadata({ locale, path, title: fmt(m.seo.routeOut.title, vars), description })
  }
  const description = best
    ? fmt(m.seo.route.description, {
        ...vars,
        n: running,
        mode: m.mode[best.mode],
        entry: best.entryData.name[locale],
        hours: formatHours(best.totalHours, locale),
      })
    : fmt(m.seo.route.descriptionNone, vars)
  return pageMetadata({ locale, path, title: fmt(m.seo.route.title, vars), description })
}

export function RoutePage(p: RouteParams) {
  const { country, city: dest, dir, path } = resolve(p)
  const { locale, m } = getI18n(requireLocale(p.lang))
  const out = dir === "out"
  const r = out ? m.routeOut : m.route
  const city = cityById(dest)!.name[locale]
  const vars = { origin: country.name[locale], country: country.name[locale], city }
  const title = fmt(r.title, vars)
  const journeys = journeysFor(country, dest, "sy", dir)
  const a = arrow(locale)
  // The list as the page shows it for a Syrian passport, each route linked to its airline or entry point, in the
  // order it is travelled.
  const routes = journeys.map((j) => {
    const who = j.airline ? DATA.airlines[j.airline].name[locale] : m.mode[j.mode]
    const legs = out ? `${city} ${a} ${j.entryData.name[locale]} ${a} ${j.city[locale]}` : `${j.city[locale]} ${a} ${j.entryData.name[locale]} ${a} ${city}`
    return {
      name: `${who} · ${legs} · ${formatHours(j.totalHours, locale)} · ${m.status[j.status]}`,
      path: j.airline ? airlinePath(j.airline) : entryPath(j.entry),
    }
  })
  const crumbs = [
    { name: m.home, path: "/" },
    { name: title, path },
  ]
  return (
    <>
      <JsonLd
        data={graph(
          breadcrumbLd(locale, crumbs),
          webPageLd(locale, { path, name: title, description: answerText(locale, country, dest, journeys, dir) }),
          ...(routes.length ? [routeListLd(locale, path, fmt(r.list, vars), routes)] : []),
        )}
      />
      <PlanView
        locale={locale}
        country={country}
        city={dest}
        dir={dir}
        heading={
          <div>
            <Breadcrumbs locale={locale} items={crumbs} />
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">{fmt(r.lede, vars)}</p>
          </div>
        }
      />
    </>
  )
}
