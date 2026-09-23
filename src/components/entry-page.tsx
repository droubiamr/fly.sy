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
import { CountryTag } from "@/components/country-tag"
import { JsonLd } from "@/components/json-ld"
import { CHIP, PageBody, PageHero, SURFACE, Section } from "@/components/page"
import { Provenance } from "@/components/provenance"
import { cn } from "@/lib/utils"
import { StatusDot, StatusBadge } from "@/components/status-badge"

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
    <>
      <JsonLd
        data={graph(
          breadcrumbLd(locale, crumbs),
          entryLd(locale, id, e, path),
          webPageLd(locale, { path, name: e.name[locale], description: e.note ? e.note[locale] : m.crossings.lede }),
        )}
      />
      <PageHero locale={locale} crumbs={crumbs} title={e.name[locale]} lede={e.note?.[locale]}>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
          <StatusBadge status={e.status} label={m.status[e.status]} solid />
          {e.country && <CountryTag code={e.country} />}
          <span>
            {m.checked} <time dateTime={e.seen}>{formatDate(e.seen, locale)}</time>
          </span>
        </div>
        <Provenance source={e.source} locale={locale} m={m} className="mt-2 justify-center text-sm" />
      </PageHero>

      <PageBody>
        <Section id="via-h" title={`${m.entry.via} ${e.name[locale]}`}>
          {via.length === 0 ? (
            <p className={cn(SURFACE, "p-5 text-sm text-muted-foreground")}>{m.entry.viaEmpty}</p>
          ) : (
            <ul className={cn(SURFACE, "divide-y px-5")}>
              {via.map((a, i) => {
                const al = a.airline ? DATA.airlines[a.airline] : null
                const o = originForArrival(a)
                return (
                  <li key={i} className="py-4">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <StatusDot status={a.status} />
                      <span className="font-semibold">
                        {m.mode[a.mode]} · {m.entry.from} {a.city[locale]}
                      </span>
                      {al && a.airline && (
                        <Link href={href(airlinePath(a.airline))} className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                          {al.name[locale]}
                        </Link>
                      )}
                      <span className="ms-auto text-sm font-semibold">{formatHours(a.hours, locale)}</span>
                    </div>
                    {a.note && <p className="mt-1.5 text-[13.5px] leading-relaxed">{a.note[locale]}</p>}
                    <Provenance confidence={a.confidence} source={a.source} seen={a.seen} locale={locale} m={m} />
                    <Link
                      href={href(routePath(o.id, destinationVia(id)))}
                      className="mt-2 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
                    >
                      {m.entry.plan} · {o.name[locale]} {arrow(locale)}
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </Section>

        {roads.length > 0 && (
          <Section id="roads-h" title={m.entry.roads} note={m.entry.roadsNote}>
            <ul className={cn(SURFACE, "grid grid-cols-2 gap-x-6 px-5 md:grid-cols-3")}>
              {roads.map(([cityId, h]) => {
                const c = DATA.cities.find((x) => x.id === cityId)
                if (!c) return null
                // Only cities with an airport have planner pages; the rest are plain text.
                const linked = origin && destinationById(cityId)
                return (
                  <li key={cityId} className="flex items-center justify-between border-b py-3 text-sm last:border-0">
                    {linked ? (
                      <Link href={href(routePath(origin.id, cityId))} className="underline-offset-4 hover:underline">
                        {c.name[locale]}
                      </Link>
                    ) : (
                      <span>{c.name[locale]}</span>
                    )}
                    <span className="font-semibold">{formatHours(h, locale)}</span>
                  </li>
                )
              })}
            </ul>
          </Section>
        )}

        <Section id="need-h" title={m.entry.need}>
          <div className="grid gap-3 xl:grid-cols-3">
            {PASSPORTS.map((pp) => (
              <div key={pp} className={cn(SURFACE, "px-5 py-4")}>
                <h3 className="font-semibold">{m.reports.form.passports[pp]}</h3>
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
          <Link href={href("/documents")} className="mt-3 inline-flex text-sm font-medium underline-offset-4 hover:underline">
            {m.footer.documents} {arrow(locale)}
          </Link>
        </Section>

        <Section id="rep-h" title={m.entry.reports}>
          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">{m.entry.reportsEmpty}</p>
          ) : (
            <ul className={cn(SURFACE, "divide-y px-5")}>
              {reports.map((r) => {
                const wait = formatMinutes(r.wait_minutes, locale)
                return (
                  <li key={r.id} className="py-4">
                    <p className="text-xs text-muted-foreground">
                      <time dateTime={r.travelled_on}>{formatDate(r.travelled_on, locale)}</time> · {m.reports.form.passports[r.passport]}
                      {wait && ` · ${m.reports.wait} ${wait}`}
                    </p>
                    <p className="mt-1 text-[14.5px] leading-relaxed">{typeof r.note === "string" ? r.note : r.note[locale]}</p>
                  </li>
                )
              })}
            </ul>
          )}
          <Link href={href("/reports")} className="mt-3 inline-flex text-sm font-medium underline-offset-4 hover:underline">
            {m.reports.title} {arrow(locale)}
          </Link>
        </Section>

        {siblings.length > 0 && (
          <Section id="sib-h" title={kind === "air" ? m.crossings.airports : m.crossings.more}>
            <ul className="flex flex-wrap gap-2">
              {siblings.map(([sid, se]) => (
                <li key={sid}>
                  <Link href={href(entryPath(sid))} className={CHIP}>
                    <StatusDot status={se.status} />
                    {se.name[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </PageBody>
    </>
  )
}
