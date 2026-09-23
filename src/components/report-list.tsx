import Link from "next/link"
import { Check } from "lucide-react"
import { DATA } from "@/lib/data"
import { entryHref } from "@/lib/entries"
import { formatDate, formatMinutes } from "@/lib/format"
import type { Locale, Report } from "@/lib/types"
import type { Messages } from "@/messages"

/** Published traveller reports as a divided list. `linkEntry` turns the entry chip into a link to its page. */
export function ReportList({
  reports,
  locale,
  m,
  linkEntry = true,
  empty,
}: {
  reports: Report[]
  locale: Locale
  m: Messages
  linkEntry?: boolean
  empty: string
}) {
  if (reports.length === 0) {
    return <p className="rounded-2xl border border-dashed px-5 py-6 text-center text-sm text-muted-foreground">{empty}</p>
  }
  return (
    <ul className="divide-y rounded-2xl border bg-card px-5">
      {reports.map((r) => {
        const entry = DATA.entries[r.entry]
        const note = typeof r.note === "string" ? r.note : r.note[locale]
        const wait = formatMinutes(r.wait_minutes, locale)
        const chip = "rounded-md bg-muted px-2 py-0.5 font-medium text-foreground"
        return (
          <li key={r.id} className="py-4">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              {entry && linkEntry ? (
                <Link href={entryHref(r.entry, entry)} className={chip}>
                  {entry.name[locale]}
                </Link>
              ) : (
                <span className={chip}>{entry ? entry.name[locale] : r.entry}</span>
              )}
              <span>{formatDate(r.travelled_on, locale)}</span>
              <span>· {m.passportShort[r.passport]}</span>
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
  )
}
