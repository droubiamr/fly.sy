import type { Metadata } from "next"
import Link from "next/link"
import { DATA, airlinePath, arrivalsBy } from "@/lib/data"
import { fmt, getI18n, requireLocale } from "@/lib/i18n"
import { pageMetadata } from "@/lib/seo"
import { breadcrumbLd, graph, webPageLd } from "@/lib/schema"
import { localePath } from "@/lib/site"
import type { Locale } from "@/lib/types"
import { AirlineLogo } from "@/components/airline-logo"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { CountryTag } from "@/components/country-tag"
import { JsonLd } from "@/components/json-ld"
import { StatusStamp } from "@/components/status-stamp"

type Props = { params: Promise<{ lang: Locale }> }
const year = () => DATA.meta.updated.slice(0, 4)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  requireLocale(lang)
  const { m } = getI18n(lang)
  return pageMetadata({
    locale: lang,
    path: "/airlines",
    title: fmt(m.seo.airlines.title, { year: year() }),
    description: m.seo.airlines.description,
  })
}

export default async function AirlinesPage({ params }: Props) {
  const { lang } = await params
  requireLocale(lang)
  const { locale, m } = getI18n(lang)
  const crumbs = [
    { name: m.home, path: "/" },
    { name: m.tabs.airlines, path: "/airlines" },
  ]
  return (
    <div>
      <JsonLd data={graph(breadcrumbLd(locale, crumbs), webPageLd(locale, { path: "/airlines", name: m.airlines.title, description: m.seo.airlines.description }))} />
      <Breadcrumbs locale={locale} items={crumbs} />
      <h1 className="text-2xl font-bold tracking-tight">{m.airlines.title}</h1>
      <p className="mt-2 mb-4 max-w-prose text-sm leading-relaxed text-muted-foreground">{m.airlines.lede}</p>
      {/* minmax(0,1fr) columns: a no-wrap city list must truncate, not widen the track. */}
      <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {Object.entries(DATA.airlines).map(([code, al]) => {
          const hops = arrivalsBy(code)
          // What the carrier is doing now, for the stamp beside its name: flying if any
          // route is open; otherwise closed only when every route is, else unknown.
          const state = hops.some((h) => h.status === "open") ? "open" : hops.every((h) => h.status === "closed") ? "closed" : "unknown"
          return (
            <li key={code}>
              <Link
                href={localePath(locale, airlinePath(code))}
                className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 transition-colors duration-100 ease-out active:bg-muted"
              >
                {/* Carriers with nothing flying stay listed, in colour, with a stamp
                    that says so: the list is also a record of who used to fly, and a
                    greyed logo reads as a broken image rather than a status. */}
                <span className="size-10 shrink-0 rounded-[10px] border bg-background p-1.5">
                  <AirlineLogo code={code} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 font-semibold">
                    <CountryTag code={al.country} />
                    <span className="truncate">{al.name[locale]}</span>
                    {state !== "open" && <StatusStamp status={state} label={m.status[state]} />}
                  </span>
                  <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">
                    {hops.length ? hops.map((h) => h.city[locale]).join(" · ") : m.airlines.empty}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
