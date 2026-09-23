import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { DATA } from "@/lib/data"
import { entryHref } from "@/lib/entries"
import { formatDate } from "@/lib/format"
import type { Entry, Locale } from "@/lib/types"
import type { Messages } from "@/messages"
import { StatusStamp } from "@/components/status-stamp"
import { CountryTag } from "@/components/country-tag"

/** Entry points as rows: name, country, status stamp, date checked. Every row is a link to its own page. */
export function EntryList({
  entries,
  locale,
  m,
  showNote = false,
}: {
  entries: [string, Entry][]
  locale: Locale
  m: Messages
  showNote?: boolean
}) {
  return (
    <ul className="divide-y rounded-2xl border bg-card">
      {entries.map(([id, e]) => (
        <li key={id}>
          <Link
            href={entryHref(id, e)}
            className="flex items-center gap-3 px-5 py-3.5 transition-colors duration-100 ease-out hover:bg-muted/60 active:bg-muted"
          >
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-semibold">
                {e.country ? <CountryTag code={e.country} /> : <CountryTag code={id} />}
                <span className="text-balance">{e.name[locale]}</span>
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {m.kind[e.kind]} · {m.checked} {formatDate(e.seen, locale)}
                {showNote && e.note && <span className="mt-1 block text-[13px] leading-relaxed text-foreground/80">{e.note[locale]}</span>}
              </span>
            </span>
            <StatusStamp status={e.status} label={m.status[e.status]} />
            <ChevronRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  )
}

export const allEntries = () => Object.entries(DATA.entries)
