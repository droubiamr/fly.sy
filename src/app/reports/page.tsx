import Link from "next/link"
import { Plus, Check } from "lucide-react"
import { DATA } from "@/lib/data"
import { getI18n } from "@/lib/i18n"
import { formatDate, formatMinutes } from "@/lib/format"
import { getPublishedReports } from "@/lib/reports"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function ReportsPage() {
  const { locale, m } = await getI18n()
  const reports = await getPublishedReports()

  return (
    <div>
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
                  <span className="rounded-md bg-muted px-2 py-0.5 font-medium text-foreground">
                    {entry ? entry.name[locale] : r.entry}
                  </span>
                  <span>{formatDate(r.travelled_on, locale)}</span>
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
          <Link href="/reports/new">
            <Plus className="size-5" strokeWidth={2.4} />
            {m.reports.add}
          </Link>
        </Button>
      </div>
    </div>
  )
}
