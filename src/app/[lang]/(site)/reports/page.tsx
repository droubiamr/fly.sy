import type { Metadata } from "next"
import Link from "next/link"
import { BadgeCheck, Plus } from "lucide-react"
import { DATA, entryPath } from "@/lib/data"
import { getI18n, requireLocale } from "@/lib/i18n"
import { formatDate, formatMinutes } from "@/lib/format"
import { getPublishedReports } from "@/lib/reports"
import { pageMetadata } from "@/lib/seo"
import { breadcrumbLd, graph, webPageLd } from "@/lib/schema"
import { localePath } from "@/lib/site"
import type { Locale } from "@/lib/types"
import { JsonLd } from "@/components/json-ld"
import { PageBody, PageHero, SURFACE } from "@/components/page"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = { params: Promise<{ lang: Locale }> }

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  requireLocale(lang)
  const { m } = getI18n(lang)
  return pageMetadata({ locale: lang, path: "/reports", title: m.seo.reports.title, description: m.seo.reports.description })
}

export default async function ReportsPage({ params }: Props) {
  const { lang } = await params
  requireLocale(lang)
  const { locale, m } = getI18n(lang)
  const reports = await getPublishedReports()
  const crumbs = [
    { name: m.home, path: "/" },
    { name: m.tabs.reports, path: "/reports" },
  ]

  return (
    <>
      <JsonLd data={graph(breadcrumbLd(locale, crumbs), webPageLd(locale, { path: "/reports", name: m.reports.title, description: m.seo.reports.description }))} />
      <PageHero locale={locale} crumbs={crumbs} title={m.reports.title} lede={m.reports.lede}>
        {/* The page's one action, in the hero like Linkat's claim button: the
            filled button inverts to light grey on the green panel. */}
        <Button asChild size="lg" className="mt-8 h-11 rounded-full px-6 text-[15px]">
          <Link href={localePath(locale, "/reports/new")}>
            <Plus data-icon="inline-start" />
            {m.reports.add}
          </Link>
        </Button>
      </PageHero>

      <PageBody>
        {reports.length === 0 ? (
          <p className={cn(SURFACE, "p-5 text-sm text-muted-foreground")}>{m.reports.empty}</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {reports.map((r) => {
              const entry = DATA.entries[r.entry]
              const note = typeof r.note === "string" ? r.note : r.note[locale]
              const wait = formatMinutes(r.wait_minutes, locale)
              return (
                <li key={r.id} className={cn(SURFACE, "px-5 py-4")}>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-muted-foreground">
                    {entry ? (
                      <Link href={localePath(locale, entryPath(r.entry))} className="rounded-4xl bg-secondary px-2.5 py-1 font-medium text-secondary-foreground">
                        {entry.name[locale]}
                      </Link>
                    ) : (
                      <span className="rounded-4xl bg-secondary px-2.5 py-1 font-medium text-secondary-foreground">{r.entry}</span>
                    )}
                    <time dateTime={r.travelled_on}>{formatDate(r.travelled_on, locale)}</time>
                    <span>· {m.reports.form.passports[r.passport]}</span>
                    {wait && (
                      <span>
                        · {m.reports.wait} {wait}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-[14.5px] leading-relaxed">{note}</p>
                  <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-status-open">
                    <BadgeCheck className="size-3.5" aria-hidden="true" />
                    {r.editor_verified ? m.reports.editor : m.reports.community}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </PageBody>
    </>
  )
}
