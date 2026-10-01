import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { DATA, DESTINATIONS, ORIGINS, airlinePath, cityById, destinationById, entryPath, originFromSlug, originSlug, routePath } from "@/lib/data"
import { fmt, getI18n, requireLocale } from "@/lib/i18n"
import { arrow, formatHours } from "@/lib/format"
import { answerFor } from "@/lib/plan"
import { pageMetadata } from "@/lib/seo"
import { breadcrumbLd, graph, routeListLd, webPageLd } from "@/lib/schema"
import type { Locale, OriginDef } from "@/lib/types"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { JsonLd } from "@/components/json-ld"
import { PlanView, answerText, journeysFor } from "@/components/plan-view"

export type RouteParams = { lang: Locale; origin: string; city: string }

/** Every country × airport city. Unknown slugs 404. The passport is a query on the page, not a segment. */
export function routeParams() {
  const out: Omit<RouteParams, "lang">[] = []
  for (const o of ORIGINS) for (const d of DESTINATIONS) out.push({ origin: originSlug(o.id), city: d.id })
  return out
}

function resolve(p: RouteParams): { origin: OriginDef; dest: string } {
  const origin = originFromSlug(p.origin)
  const dest = destinationById(p.city)?.id
  if (!origin || !dest) notFound()
  return { origin, dest }
}

export function routeMetadata(p: RouteParams): Metadata {
  const { origin, dest } = resolve(p)
  const { locale, m } = getI18n(requireLocale(p.lang))
  const vars = { origin: origin.name[locale], city: cityById(dest)!.name[locale] }
  // The same pick as the sentence the page opens with: the fastest route that is running.
  const { best, running } = answerFor(journeysFor(origin, dest, "sy"))
  const description = best
    ? fmt(m.seo.route.description, {
        ...vars,
        n: running,
        mode: m.mode[best.mode],
        entry: best.entryData.name[locale],
        hours: formatHours(best.totalHours, locale),
      })
    : fmt(m.seo.route.descriptionNone, vars)
  return pageMetadata({ locale, path: routePath(origin.id, dest), title: fmt(m.seo.route.title, vars), description })
}

export function RoutePage(p: RouteParams) {
  const { origin, dest } = resolve(p)
  const { locale, m } = getI18n(requireLocale(p.lang))
  const vars = { origin: origin.name[locale], city: cityById(dest)!.name[locale] }
  const path = routePath(origin.id, dest)
  const title = fmt(m.route.title, vars)
  const journeys = journeysFor(origin, dest, "sy")
  const city = cityById(dest)!.name[locale]
  // The list as the page shows it for a Syrian passport, each route linked to its airline or entry point.
  const routes = journeys.map((j) => ({
    name: `${j.airline ? DATA.airlines[j.airline].name[locale] : m.mode[j.mode]} · ${j.city[locale]} ${arrow(locale)} ${j.entryData.name[locale]} ${arrow(locale)} ${city} · ${formatHours(j.totalHours, locale)} · ${m.status[j.status]}`,
    path: j.airline ? airlinePath(j.airline) : entryPath(j.entry),
  }))
  const crumbs = [
    { name: m.home, path: "/" },
    { name: title, path },
  ]
  return (
    <>
      <JsonLd
        data={graph(
          breadcrumbLd(locale, crumbs),
          webPageLd(locale, { path, name: title, description: answerText(locale, origin, dest, journeys) }),
          ...(routes.length ? [routeListLd(locale, path, fmt(m.route.list, vars), routes)] : []),
        )}
      />
      <PlanView
        locale={locale}
        origin={origin}
        dest={dest}
        heading={
          <div>
            <Breadcrumbs locale={locale} items={crumbs} />
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">{fmt(m.route.lede, vars)}</p>
          </div>
        }
      />
    </>
  )
}
