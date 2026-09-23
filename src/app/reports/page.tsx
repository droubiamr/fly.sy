import Link from "next/link"
import { Plus } from "lucide-react"
import { DATA } from "@/lib/data"
import { getI18n } from "@/lib/i18n"
import { pageMetadata } from "@/lib/metadata"
import { getPublishedReports } from "@/lib/reports"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/page-header"
import { ReportList } from "@/components/report-list"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export const generateMetadata = () => pageMetadata((m) => ({ title: m.reports.title, description: m.reports.lede }))

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ entry?: string }> }) {
  const { entry } = await searchParams
  const { locale, m } = await getI18n()
  const filter = entry && DATA.entries[entry] ? entry : null
  const all = await getPublishedReports()
  const reports = filter ? all.filter((r) => r.entry === filter) : all
  const chip = (on: boolean) =>
    cn(
      "inline-flex min-h-9 items-center rounded-full px-3.5 text-[13px] transition-colors duration-150 ease-out",
      on ? "bg-foreground font-semibold text-background" : "bg-muted text-muted-foreground",
    )

  return (
    <div>
      <PageHeader title={m.reports.title} lede={m.reports.lede}>
        <Button asChild className="h-11 rounded-full px-5 shadow-none">
          <Link href={filter ? `/reports/new?entry=${filter}` : "/reports/new"}>
            <Plus className="size-4" strokeWidth={2.4} aria-hidden="true" />
            {m.reports.add}
          </Link>
        </Button>
      </PageHeader>

      <nav aria-label={m.reports.filter} className="-mx-5 mb-4 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
        <Link href="/reports" className={chip(!filter)} aria-current={!filter ? "page" : undefined}>
          {m.reports.all}
        </Link>
        {Object.entries(DATA.entries).map(([id, e]) => (
          <Link key={id} href={`/reports?entry=${id}`} className={cn(chip(filter === id), "whitespace-nowrap")} aria-current={filter === id ? "page" : undefined}>
            {e.name[locale]}
          </Link>
        ))}
      </nav>

      <ReportList reports={reports} locale={locale} m={m} empty={m.reports.empty} />
    </div>
  )
}
