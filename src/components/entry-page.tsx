import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  DATA,
  airEntries,
  airlinePath,
  arrivalsVia,
  destinationById,
  destinationVia,
  entryFromSlug,
  entryPath,
  entrySlug,
  landEntries,
  originForArrival,
  routePath,
} from "@/lib/data"
import { fmt, getI18n, requireLocale } from "@/lib/i18n"
import { arrow, formatDate, formatHours, formatMinutes } from "@/lib/format"
import { pageMetadata } from "@/lib/seo"
import { breadcrumbLd, entryLd, graph, webPageLd } from "@/lib/schema"
import { localePath } from "@/lib/site"
import type { Locale, Mode, Passport } from "@/lib/types"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { CountryTag } from "@/components/country-tag"
import { JsonLd } from "@/components/json-ld"
import { Provenance } from "@/components/provenance"
import { StatusDot, StatusStamp } from "@/components/status-stamp"

export type EntryParams = { lang: Locale; slug: string }
const PASSPORTS: Passport[] = ["sy", "voa", "res"]

export const entryParams = (kind: Mode) =>
  (kind === "air" ? airEntries() : landEntries()).map(([id]) => ({ slug: entrySlug(id) }))

function resolve(p: EntryParams, kind: Mode) {
  const id = entryFromSlug(p.slug)
  const e = id ? DATA.entries[id] : undefined
  if (!id || !e || e.kind !== kind) notFound()
  return { id, e }
}

export function entryMetadata(p: EntryParams, kind: Mode): Metadata {
  const { id, e } = resolve(p, kind)
  const { locale, m } = getI18n(requireLocale(p.lang))
  const src = DATA.sources[e.source]
  const vars = {
    name: e.name[locale],
    status: m.status[e.status],
    seen: formatDate(e.seen, locale),
    source: src ? src.name[locale] : e.source,
    note: e.note ? e.note[locale] : "",
  }
  const air = kind === "air"
  return pageMetadata({
    locale,
    path: entryPath(id),
    title: fmt(air ? m.seo.entry.airportTitle : m.seo.entry.title, vars),
    description: fmt(air ? m.seo.entry.airportDescription : m.seo.entry.description, vars).replace(/\s{2,}/g, " "),
  })
}

export function EntryPage(p: EntryParams, kind: Mode) {
  const { id, e } = resolve(p, kind)
  const { locale, m } = getI18n(requireLocale(p.lang))
  const href = (x: string) => localePath(locale, x)
  const path = entryPath(id)
  const via = arrivalsVia(id)
  const roads = Object.entries(DATA.roads[id] ?? {}).sort((a, b) => a[1] - b[1])
  const reports = DATA.seedReports.filter((r) => r.status === "published" && r.entry === id)
  // City links go to the planner page for the country most people reach this entry from.
  const origin = via[0] ? originForArrival(via[0]) : undefined
  const crumbs = [
    { name: m.home, path: "/" },
    { name: kind === "air" ? m.crossings.airports : m.tabs.crossings, path: "/crossings" },
    { name: e.name[locale], path },
  ]
  const siblings = (kind === "air" ? airEntries() : landEntries()).filter(([x]) => x !== id)

  return (
    <div className="flex flex-col gap-7">
      <JsonLd
        data={graph(
          breadcrumbLd(locale, crumbs),
          entryLd(locale, id, e, path),
          webPageLd(locale, { path, name: e.name[locale], description: e.note ? e.note[locale] : m.crossings.lede }),
        )}
      />
      <section>
        <Breadcrumbs locale={locale} items={crumbs} />
        <div className="flex items-start justify-between gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            {e.country && <CountryTag code={e.country} />}
            {e.name[locale]}
          </h1>
          <StatusStamp status={e.status} label={m.status[e.status]} className="mt-1.5" />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {m.checked} <time dateTime={e.seen}>{formatDate(e.seen, locale)}</time>
        </p>
        {e.note && <p className="mt-3 max-w-prose text-[14.5px] leading-relaxed">{e.note[locale]}</p>}
        <Provenance source={e.source} locale={locale} m={m} />
      </section>

      <section aria-labelledby="via-h">
        <h2 id="via-h" className="mb-2 text-[15px] font-semibold">
          {m.entry.via} {e.name[locale]}
        </h2>
        {via.length === 0 ? (
          <p className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">{m.entry.viaEmpty}</p>
        ) : (
          <ul className="divide-y rounded-2xl border bg-card px-5">
            {via.map((a, i) => {
              const al = a.airline ? DATA.airlines[a.airline] : null
              const o = originForArrival(a)
              return (
                <li key={i} className="py-3">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <StatusDot status={a.status} />
                    <span className="font-semibold">
                      {m.mode[a.mode]} · {m.entry.from} {a.city[locale]}
                    </span>
                    {al && a.airline && (
                      <Link href={href(airlinePath(a.airline))} className="text-primary underline-offset-4 hover:underline">
                        {al.name[locale]}
                      </Link>
                    )}
                    <span className="ms-auto text-[13px] text-muted-foreground">{formatHours(a.hours, locale)}</span>
                  </div>
                  {a.note && <p className="mt-1 text-[13px] leading-relaxed">{a.note[locale]}</p>}
                  <Provenance confidence={a.confidence} source={a.source} seen={a.seen} locale={locale} m={m} />
                  <p className="mt-1.5 text-xs">
                    <Link href={href(routePath(o.id, destinationVia(id)))} className="text-primary underline-offset-4 hover:underline">
                      {m.entry.plan} · {o.name[locale]} {arrow(locale)}
                    </Link>
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {roads.length > 0 && (
        <section aria-labelledby="roads-h">
          <h2 id="roads-h" className="mb-1 text-[15px] font-semibold">
            {m.entry.roads}
          </h2>
          <p className="mb-2 text-xs text-muted-foreground">{m.entry.roadsNote}</p>
          <ul className="grid grid-cols-2 gap-x-4 rounded-2xl border bg-card px-5 sm:grid-cols-3">
            {roads.map(([cityId, h]) => {
              const c = DATA.cities.find((x) => x.id === cityId)
              if (!c) return null
              // Only cities with an airport have planner pages; the rest are plain text.
              const linked = origin && destinationById(cityId)
              return (
                <li key={cityId} className="flex items-center justify-between border-b py-2.5 text-sm last:border-0">
                  {linked ? (
                    <Link href={href(routePath(origin.id, cityId))} className="underline-offset-4 hover:underline">
                      {c.name[locale]}
                    </Link>
                  ) : (
                    <span>{c.name[locale]}</span>
                  )}
                  <span className="text-[13px] text-muted-foreground">{formatHours(h, locale)}</span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section aria-labelledby="need-h">
        <h2 id="need-h" className="mb-2 text-[15px] font-semibold">
          {m.entry.need}
        </h2>
        <div className="flex flex-col gap-3">
          {PASSPORTS.map((pp) => (
            <div key={pp} className="rounded-2xl border bg-card px-5 py-4">
              <h3 className="text-[13.5px] font-semibold">{m.reports.form.passports[pp]}</h3>
              <ul className="mt-2 flex list-disc flex-col gap-2.5 ps-4 text-[13.5px] leading-relaxed">
                {DATA.needs[kind][pp].map((n, i) => (
                  <li key={i}>
                    {n.text[locale]}
                    <Provenance source={n.source} locale={locale} m={m} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs">
          <Link href={href("/documents")} className="text-primary underline-offset-4 hover:underline">
            {m.footer.documents} {arrow(locale)}
          </Link>
        </p>
      </section>

      <section aria-labelledby="rep-h">
        <h2 id="rep-h" className="mb-2 text-[15px] font-semibold">
          {m.entry.reports}
        </h2>
        {reports.length === 0 ? (
          <p className="text-sm text-muted-foreground">{m.entry.reportsEmpty}</p>
        ) : (
          <ul className="divide-y rounded-2xl border bg-card px-5">
            {reports.map((r) => {
              const wait = formatMinutes(r.wait_minutes, locale)
              return (
                <li key={r.id} className="py-3">
                  <p className="text-xs text-muted-foreground">
                    <time dateTime={r.travelled_on}>{formatDate(r.travelled_on, locale)}</time> · {m.reports.form.passports[r.passport]}
                    {wait && ` · ${m.reports.wait} ${wait}`}
                  </p>
                  <p className="mt-1 text-[14px] leading-relaxed">{typeof r.note === "string" ? r.note : r.note[locale]}</p>
                </li>
              )
            })}
          </ul>
        )}
        <p className="mt-2 text-xs">
          <Link href={href("/reports")} className="text-primary underline-offset-4 hover:underline">
            {m.reports.title} {arrow(locale)}
          </Link>
        </p>
      </section>

      {siblings.length > 0 && (
        <section aria-labelledby="sib-h">
          <h2 id="sib-h" className="mb-2 text-[15px] font-semibold">
            {kind === "air" ? m.crossings.airports : m.crossings.more}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {siblings.map(([sid, se]) => (
              <li key={sid}>
                <Link href={href(entryPath(sid))} className="inline-flex min-h-11 items-center gap-2 rounded-full border bg-card px-4 text-sm">
                  <StatusDot status={se.status} />
                  {se.name[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
