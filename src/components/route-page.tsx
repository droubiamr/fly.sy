import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { DESTINATIONS, ORIGINS, PASSPORTS, cityById, destinationById, originFromSlug, originSlug, routePath } from "@/lib/data"
import { fmt, getI18n, requireLocale } from "@/lib/i18n"
import { formatHours } from "@/lib/format"
import { pageMetadata } from "@/lib/seo"
import { breadcrumbLd, graph, webPageLd } from "@/lib/schema"
import { PASSPORT_SLUGS, passportFromSlug } from "@/lib/slugs"
import type { Locale, OriginDef, Passport } from "@/lib/types"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { JsonLd } from "@/components/json-ld"
import { PlanView, journeysFor, passportName } from "@/components/plan-view"

export type RouteParams = { lang: Locale; origin: string; city: string; passport?: string }

/** Every country × airport city, and with every non-Syrian passport when asked. Unknown slugs 404. */
export function routeParams(withPassport: boolean) {
  const out: Omit<RouteParams, "lang">[] = []
  for (const o of ORIGINS)
    for (const d of DESTINATIONS) {
      if (!withPassport) out.push({ origin: originSlug(o.id), city: d.id })
      else for (const p of PASSPORTS) if (p.id !== "sy") out.push({ origin: originSlug(o.id), city: d.id, passport: PASSPORT_SLUGS[p.id] })
    }
  return out
}

function resolve(p: RouteParams): { origin: OriginDef; dest: string; passport: Passport } {
  const origin = originFromSlug(p.origin)
  const passport = p.passport === undefined ? "sy" : passportFromSlug(p.passport)
  const dest = destinationById(p.city)?.id
  // The Syrian passport is the default page; naming it explicitly would be a second URL for the same content.
  if (!origin || !dest || !passport || (p.passport !== undefined && passport === "sy")) notFound()
  return { origin, dest, passport }
}

export function routeMetadata(p: RouteParams): Metadata {
  const { origin, dest, passport } = resolve(p)
  const { locale, m } = getI18n(requireLocale(p.lang))
  const vars = { origin: origin.name[locale], city: cityById(dest)!.name[locale], passport: passportName(passport, locale) }
  const live = journeysFor({ origin, dest, passport }).filter((j) => !j.blocked)
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
  return pageMetadata({
    locale,
    path: routePath(origin.id, dest, passport),
    title: fmt(passport === "sy" ? m.seo.route.title : m.seo.route.titlePassport, vars),
    description,
  })
}

export function RoutePage(p: RouteParams) {
  const { origin, dest, passport } = resolve(p)
  const { locale, m } = getI18n(requireLocale(p.lang))
  const vars = { origin: origin.name[locale], city: cityById(dest)!.name[locale], passport: passportName(passport, locale) }
  const path = routePath(origin.id, dest, passport)
  const title = fmt(m.route.title, vars)
  const crumbs = [
    { name: m.home, path: "/" },
    ...(passport === "sy"
      ? [{ name: title, path }]
      : [
          { name: title, path: routePath(origin.id, dest) },
          { name: vars.passport, path },
        ]),
  ]
  return (
    <>
      <JsonLd data={graph(breadcrumbLd(locale, crumbs), webPageLd(locale, { path, name: title, description: fmt(m.route.lede, vars) }))} />
      <PlanView
        locale={locale}
        origin={origin}
        dest={dest}
        passport={passport}
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
