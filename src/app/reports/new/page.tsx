import type { Metadata } from "next"
import { getI18n } from "@/lib/i18n"
import { supabaseConfigured } from "@/lib/supabase/server"
import { DATA } from "@/lib/data"
import { ReportForm } from "@/components/report-form"

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n()
  return { title: m.reports.form.title }
}

export default async function NewReportPage() {
  const { m } = await getI18n()
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{m.reports.form.title}</h1>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{m.reports.form.lede}</p>
      <div className="mt-6">
        <ReportForm configured={supabaseConfigured()} contactUrl={`mailto:${DATA.meta.contact}`} />
      </div>
    </div>
  )
}
