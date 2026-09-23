import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { DATA, airlineFromSlug, airlinePath, airlineSlug, arrivalsBy, destinationVia, entryPath, originForArrival, routePath } from "@/lib/data"
import { fmt, getI18n, requireLocale } from "@/lib/i18n"
import { arrow, formatHours } from "@/lib/format"
import { pageMetadata } from "@/lib/seo"
import { airlineLd, breadcrumbLd, graph, webPageLd } from "@/lib/schema"
import { LOCALES, localePath } from "@/lib/site"
import type { Locale } from "@/lib/types"
import { AirlineLogo } from "@/components/airline-logo"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { CountryTag } from "@/components/country-tag"
import { JsonLd } from "@/components/json-ld"
import { Provenance } from "@/components/provenance"
import { StatusDot, StatusStamp } from "@/components/status-stamp"

type Params = { lang: Locale; slug: string }
type Props = { params: Promise<Params> }

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => Object.keys(DATA.airlines).map((code) => ({ lang, slug: airlineSlug(code) })))
}

function resolve(slug: string) {
  const code = airlineFromSlug(slug)
  if (!code) notFound()
  return { code, al: DATA.airlines[code], hops: arrivalsBy(code) }
}

/** The same sentence serves the meta description and the WebPage JSON-LD. */
function describe(lang: Locale, code: string) {
  const { al, hops } = resolve(airlineSlug(code))
  const { m } = getI18n(lang)
  const routes = hops.map((h) => `${h.city[lang]} ${arrow(lang)} ${DATA.entries[h.entry].name[lang]}`).join(lang === "ar" ? "، " : ", ")
  return fmt(m.seo.airline.description, { airline: al.name[lang], routes: routes || m.airlines.empty })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params
  requireLocale(lang)
  const { code, al } = resolve(slug)
  const { m } = getI18n(lang)
  return pageMetadata({
    locale: lang,
    path: airlinePath(code),
    title: fmt(m.seo.airline.title, { airline: al.name[lang] }),
    description: describe(lang, code),
  })
}

export default async function AirlinePage({ params }: Props) {
  const { lang, slug } = await params
  requireLocale(lang)
  const { code, al, hops } = resolve(slug)
  const { locale, m } = getI18n(lang)
  const href = (x: string) => localePath(locale, x)
  const path = airlinePath(code)
  // What the carrier is doing now: flying if any route is open; otherwise closed only when every route is, else unknown.
  const state = hops.some((h) => h.status === "open") ? "open" : hops.every((h) => h.status === "closed") ? "closed" : "unknown"
  const crumbs = [
    { name: m.home, path: "/" },
    { name: m.tabs.airlines, path: "/airlines" },
    { name: al.name[locale], path },
  ]
  const others = Object.keys(DATA.airlines).filter((c) => c !== code)
  return (
    <div className="flex flex-col gap-7">
      <JsonLd
        data={graph(
          breadcrumbLd(locale, crumbs),
          airlineLd(locale, code, path),
          webPageLd(locale, { path, name: al.name[locale], description: describe(locale, code) }),
        )}
      />
      <section>
        <Breadcrumbs locale={locale} items={crumbs} />
        <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight">
          <span className="size-10 shrink-0 rounded-[10px] border bg-background p-1.5">
            <AirlineLogo code={code} />
          </span>
          {al.name[locale]}
          {state !== "open" && <StatusStamp status={state} label={m.status[state]} />}
        </h1>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          {m.airlines.country} <CountryTag code={al.country} /> · <span className="font-mono text-xs">{code}</span>
        </p>
      </section>

      <section aria-labelledby="r-h">
        <h2 id="r-h" className="mb-2 text-[15px] font-semibold">
          {m.airlines.routes}
        </h2>
        {hops.length === 0 ? (
          <p className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">{m.airlines.empty}</p>
        ) : (
          <ul className="divide-y rounded-2xl border bg-card px-5">
            {hops.map((h, i) => {
              const o = originForArrival(h)
              return (
                <li key={i} className="py-3">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <StatusDot status={h.status} />
                    <span className="font-semibold">{h.city[locale]}</span>
                    <span className="text-xs text-muted-foreground">{arrow(locale)}</span>
                    <Link href={href(entryPath(h.entry))} className="font-semibold underline-offset-4 hover:underline">
                      {DATA.entries[h.entry].name[locale]}
                    </Link>
                    <span className="ms-auto text-[13px] text-muted-foreground">{formatHours(h.hours, locale)}</span>
                  </div>
                  {h.note && <p className="mt-1 text-[13px] leading-relaxed">{h.note[locale]}</p>}
                  <Provenance confidence={h.confidence} source={h.source} seen={h.seen} locale={locale} m={m} />
                  <p className="mt-1.5 text-xs">
                    <Link href={href(routePath(o.id, destinationVia(h.entry)))} className="text-primary underline-offset-4 hover:underline">
                      {m.entry.plan} · {o.name[locale]} {arrow(locale)}
                    </Link>
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="o-h">
        <h2 id="o-h" className="mb-2 text-[15px] font-semibold">
          {m.airlines.more}
        </h2>
        <ul className="flex flex-wrap gap-2">
          {others.map((c) => (
            <li key={c}>
              <Link href={href(airlinePath(c))} className="inline-flex min-h-11 items-center gap-2 rounded-full border bg-card px-3 text-sm">
                <span className="size-6 shrink-0 rounded-[6px] border bg-background p-0.5">
                  <AirlineLogo code={c} />
                </span>
                {DATA.airlines[c].name[locale]}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
