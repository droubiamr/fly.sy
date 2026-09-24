import type { Metadata } from "next"
import Link from "next/link"
import { Plus, Check } from "lucide-react"
import { DATA, entryPath } from "@/lib/data"
import { getI18n, requireLocale } from "@/lib/i18n"
import { formatDate, formatMinutes } from "@/lib/format"
import { getPublishedReports } from "@/lib/reports"
import { pageMetadata } from "@/lib/seo"
import { breadcrumbLd, graph, webPageLd } from "@/lib/schema"
import { localePath } from "@/lib/site"
import type { Locale } from "@/lib/types"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { JsonLd } from "@/components/json-ld"
import { Button } from "@/components/ui/button"

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
    <div>
      <JsonLd data={graph(breadcrumbLd(locale, crumbs), webPageLd(locale, { path: "/reports", name: m.reports.title, description: m.seo.reports.description }))} />
      <Breadcrumbs locale={locale} items={crumbs} />
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{m.reports.title}</h1>
          <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">{m.reports.lede}</p>
        </div>
      </div>

      {reports.length === 0 ? (
        <p className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">{m.reports.empty}</p>
      ) : (
        <ul className="divide-y rounded-2xl border bg-card px-5">
          {reports.map((r) => {
            const entry = DATA.entries[r.entry]
            const note = typeof r.note === "string" ? r.note : r.note[locale]
            const wait = formatMinutes(r.wait_minutes, locale)
            return (
              <li key={r.id} className="py-4">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  {entry ? (
                    <Link href={localePath(locale, entryPath(r.entry))} className="rounded-md bg-muted px-2 py-0.5 font-medium text-foreground">
                      {entry.name[locale]}
                    </Link>
                  ) : (
                    <span className="rounded-md bg-muted px-2 py-0.5 font-medium text-foreground">{r.entry}</span>
                  )}
                  <time dateTime={r.travelled_on}>{formatDate(r.travelled_on, locale)}</time>
                  <span>· {m.reports.form.passports[r.passport]}</span>
                  {wait && (
                    <span>
                      · {m.reports.wait} {wait}
                    </span>
                  )}
                  <span className="ms-auto inline-flex items-center gap-1 font-medium text-primary">
                    <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                    {r.editor_verified ? m.reports.editor : m.reports.community}
                  </span>
                </div>
                <p className="mt-2 text-[14.5px] leading-relaxed">{note}</p>
              </li>
            )
          })}
        </ul>
      )}

      <div className="fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom,0px))] z-10 mx-auto flex max-w-2xl justify-end px-5">
        <Button asChild size="lg" className="h-12 rounded-full px-5 shadow-none">
          <Link href={localePath(locale, "/reports/new")}>
            <Plus className="size-5" strokeWidth={2.4} />
            {m.reports.add}
          </Link>
        </Button>
      </div>
    </div>
  )
}
