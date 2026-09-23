import type { Metadata } from "next"
import { getI18n, requireLocale } from "@/lib/i18n"
import { supabaseConfigured } from "@/lib/supabase/server"
import { DATA } from "@/lib/data"
import { pageMetadata } from "@/lib/seo"
import type { Locale } from "@/lib/types"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { ReportForm } from "@/components/report-form"

type Props = { params: Promise<{ lang: Locale }> }

/** A form, not an answer: kept out of the index so the reports list is what ranks. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  requireLocale(lang)
  const { m } = getI18n(lang)
  return pageMetadata({ locale: lang, path: "/reports/new", title: m.seo.reportNew.title, description: m.seo.reportNew.description, noindex: true })
}

export default async function NewReportPage({ params }: Props) {
  const { lang } = await params
  requireLocale(lang)
  const { locale, m } = getI18n(lang)
  return (
    <div>
      <Breadcrumbs
        locale={locale}
        items={[
          { name: m.home, path: "/" },
          { name: m.tabs.reports, path: "/reports" },
          { name: m.reports.add, path: "/reports/new" },
        ]}
      />
      <h1 className="text-2xl font-bold tracking-tight">{m.reports.form.title}</h1>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{m.reports.form.lede}</p>
      <div className="mt-6">
        <ReportForm configured={supabaseConfigured()} contactUrl={`mailto:${DATA.meta.contact}`} />
      </div>
    </div>
  )
}
