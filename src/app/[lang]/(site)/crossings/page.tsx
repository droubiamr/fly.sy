import type { Metadata } from "next"
import Link from "next/link"
import { DATA, airEntries, arrivalsVia, entryPath, landEntries } from "@/lib/data"
import { getI18n, requireLocale } from "@/lib/i18n"
import { formatDate } from "@/lib/format"
import { pageMetadata } from "@/lib/seo"
import { breadcrumbLd, graph, webPageLd } from "@/lib/schema"
import { localePath } from "@/lib/site"
import type { Locale } from "@/lib/types"
import { CountryTag } from "@/components/country-tag"
import { JsonLd } from "@/components/json-ld"
import { PageBody, PageHero, SURFACE, Section } from "@/components/page"
import { Provenance } from "@/components/provenance"
import { cn } from "@/lib/utils"
import { StatusBadge } from "@/components/status-badge"

type Props = { params: Promise<{ lang: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  requireLocale(lang)
  const { m } = getI18n(lang)
  return pageMetadata({ locale: lang, path: "/crossings", title: m.seo.crossings.title, description: m.seo.crossings.description })
}

export default async function CrossingsPage({ params }: Props) {
  const { lang } = await params
  requireLocale(lang)
  const { locale, m } = getI18n(lang)
  const href = (x: string) => localePath(locale, x)
  const crumbs = [
    { name: m.home, path: "/" },
    { name: m.tabs.crossings, path: "/crossings" },
  ]
  const Card = ({ id, e }: { id: string; e: (typeof DATA.entries)[string] }) => (
    <li className={cn(SURFACE, "px-5 py-4")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-semibold">
            {e.country && <CountryTag code={e.country} />}
            <Link href={href(entryPath(id))} className="underline-offset-4 hover:underline">
              {e.name[locale]}
            </Link>
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {m.checked} <time dateTime={e.seen}>{formatDate(e.seen, locale)}</time>
          </p>
        </div>
        <StatusBadge status={e.status} label={m.status[e.status]} />
      </div>
      {e.note && <p className="mt-3 text-[13.5px] leading-relaxed">{e.note[locale]}</p>}
      <Provenance source={e.source} locale={locale} m={m} />
      <p className="mt-2 text-xs text-muted-foreground">
        {m.entry.via} {e.name[locale]}: {arrivalsVia(id).map((a) => a.city[locale]).join(" · ") || m.entry.viaEmpty}
      </p>
    </li>
  )
  return (
    <>
      <JsonLd data={graph(breadcrumbLd(locale, crumbs), webPageLd(locale, { path: "/crossings", name: m.crossings.title, description: m.seo.crossings.description }))} />
      <PageHero locale={locale} crumbs={crumbs} title={m.crossings.title} lede={m.crossings.lede} />
      <PageBody>
        <ul className="grid gap-3 md:grid-cols-2">
          {landEntries().map(([id, e]) => (
            <Card key={id} id={id} e={e} />
          ))}
        </ul>
        <Section id="ap-h" title={m.crossings.airports} note={m.crossings.airportsLede} className="scroll-mt-24">
          <ul className="grid gap-3 md:grid-cols-2">
            {airEntries().map(([id, e]) => (
              <Card key={id} id={id} e={e} />
            ))}
          </ul>
        </Section>
      </PageBody>
    </>
  )
}
