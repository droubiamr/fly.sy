import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { DESTINATIONS, ORIGINS, cityById, destinationById, originFromSlug, originSlug, routePath } from "@/lib/data"
import { fmt, getI18n, requireLocale } from "@/lib/i18n"
import { formatHours } from "@/lib/format"
import { pageMetadata } from "@/lib/seo"
import { breadcrumbLd, graph, webPageLd } from "@/lib/schema"
import type { Locale, OriginDef } from "@/lib/types"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { JsonLd } from "@/components/json-ld"
import { PlanView, journeysFor } from "@/components/plan-view"

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
  const live = journeysFor(origin, dest, "sy").filter((j) => !j.blocked)
  const best = live.find((j) => j.totalHours != null)
  const description = best
    ? fmt(m.seo.route.description, {
        ...vars,
        n: live.length,
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
  const crumbs = [
    { name: m.home, path: "/" },
    { name: title, path },
  ]
  return (
    <>
      <JsonLd data={graph(breadcrumbLd(locale, crumbs), webPageLd(locale, { path, name: title, description: fmt(m.route.lede, vars) }))} />
      <PlanView
        locale={locale}
        origin={origin}
        dest={dest}
        heading={
          <div>
            <Breadcrumbs locale={locale} items={crumbs} />
            <h1 className="text-[28px] font-bold leading-tight tracking-tight">{title}</h1>
            <p className="mt-2 max-w-prose text-lg leading-relaxed text-muted-foreground">{fmt(m.route.lede, vars)}</p>
          </div>
        }
      />
    </>
  )
}
