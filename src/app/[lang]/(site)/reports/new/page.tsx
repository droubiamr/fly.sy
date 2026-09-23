import type { Metadata } from "next"
import { getI18n, requireLocale } from "@/lib/i18n"
import { supabaseConfigured } from "@/lib/supabase/server"
import { DATA } from "@/lib/data"
import { pageMetadata } from "@/lib/seo"
import type { Locale } from "@/lib/types"
import { PageBody, PageHero, SURFACE } from "@/components/page"
import { ReportForm } from "@/components/report-form"
import { cn } from "@/lib/utils"

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
    <>
      <PageHero
        locale={locale}
        crumbs={[
          { name: m.home, path: "/" },
          { name: m.tabs.reports, path: "/reports" },
          { name: m.reports.add, path: "/reports/new" },
        ]}
        title={m.reports.form.title}
        lede={m.reports.form.lede}
      />
      <PageBody narrow>
        {/* Linkat's sign-in card: one rounded card holding the whole form. */}
        <div className={cn(SURFACE, "p-5 md:p-7")}>
          <ReportForm configured={supabaseConfigured()} contactUrl={`mailto:${DATA.meta.contact}`} />
        </div>
      </PageBody>
    </>
  )
}
