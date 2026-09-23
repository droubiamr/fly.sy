import { getI18n } from "@/lib/i18n"
import { pageMetadata } from "@/lib/metadata"
import { supabaseConfigured } from "@/lib/supabase/server"
import { DATA } from "@/lib/data"
import { PageHeader } from "@/components/page-header"
import { ReportForm } from "@/components/report-form"

export const generateMetadata = () => pageMetadata((m) => ({ title: m.reports.form.title, description: m.reports.form.lede }))

export default async function NewReportPage({ searchParams }: { searchParams: Promise<{ entry?: string }> }) {
  const { entry } = await searchParams
  const { m } = await getI18n()
  return (
    <div>
      <PageHeader back={{ href: "/reports", label: m.reports.title }} title={m.reports.form.title} lede={m.reports.form.lede} />
      <ReportForm
        configured={supabaseConfigured()}
        contactUrl={DATA.meta.reportContact}
        defaultEntry={entry && DATA.entries[entry] ? entry : undefined}
      />
    </div>
  )
}
