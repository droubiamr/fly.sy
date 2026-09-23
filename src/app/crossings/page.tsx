import type { Metadata } from "next"
import { DATA } from "@/lib/data"
import { getI18n } from "@/lib/i18n"
import { formatDate } from "@/lib/format"
import { StatusStamp } from "@/components/status-stamp"
import { CountryTag } from "@/components/country-tag"
import { Provenance } from "@/components/provenance"

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n()
  return { title: m.crossings.title }
}

export default async function CrossingsPage() {
  const { locale, m } = await getI18n()
  const land = Object.entries(DATA.entries).filter(([, e]) => e.kind === "land")
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold tracking-tight">{m.crossings.title}</h1>
      <ul className="flex flex-col gap-2.5">
        {land.map(([id, e]) => (
          <li key={id} className="rounded-2xl border bg-card px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 font-semibold">
                  {e.country && <CountryTag code={e.country} />}
                  {e.name[locale]}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {m.checked} {formatDate(e.seen, locale)}
                </p>
              </div>
              <StatusStamp status={e.status} label={m.status[e.status]} />
            </div>
            {e.note && <p className="mt-3 text-[13.5px] leading-relaxed">{e.note[locale]}</p>}
            <Provenance source={e.source} locale={locale} m={m} />
          </li>
        ))}
      </ul>
    </div>
  )
}
