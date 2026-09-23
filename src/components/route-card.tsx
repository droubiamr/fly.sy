import { Plane, Car, ArrowRight, MoveRight } from "lucide-react"
import { DATA, cityById } from "@/lib/data"
import { formatHours } from "@/lib/format"
import type { Journey } from "@/lib/plan"
import type { Locale, Passport } from "@/lib/types"
import type { Messages } from "@/messages"
import { StatusStamp } from "@/components/status-stamp"
import { Provenance } from "@/components/provenance"
import { AirlineLogo } from "@/components/airline-logo"

export function RouteCard({
  journey: j,
  dest,
  passport,
  rank,
  locale,
  m,
}: {
  journey: Journey
  dest: string
  passport: Passport
  rank: number
  locale: Locale
  m: Messages
}) {
  const city = cityById(dest)!
  const airline = j.airline ? DATA.airlines[j.airline] : null
  const operator = airline ? `${airline.name[locale]} · ${j.city[locale]}` : `${m.fromCity} ${j.city[locale]}`
  const needs = DATA.needs[j.entryData.kind][passport]

  if (j.blocked) {
    return (
      <div className="rounded-2xl border bg-card px-5 py-4 opacity-70">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold">
              {m.mode[j.mode]} · {j.entryData.name[locale]} → {city.name[locale]}
            </p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">{operator}</p>
          </div>
          <StatusStamp status="closed" label={m.blocked} />
        </div>
        <p className="mt-3 text-[13px] text-destructive">{m.blockedWhy}</p>
      </div>
    )
  }

  return (
    <details className="group rounded-2xl border bg-card open:bg-card">
      {/* A full-width row answers a press the way a native list row does, with a
          background, not a scale. */}
      <summary className="flex cursor-pointer list-none items-start gap-3 rounded-2xl px-5 py-4 transition-colors duration-100 ease-out active:bg-muted [&::-webkit-details-marker]:hidden">
        <span className="pt-0.5 text-xs font-bold text-muted-foreground">{rank}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">
            {m.mode[j.mode]} · {j.entryData.name[locale]} → {city.name[locale]}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
            {j.airline && (
              <span className="size-4 shrink-0">
                <AirlineLogo code={j.airline} />
              </span>
            )}
            <span className="truncate">{operator}</span>
          </span>
          <span className="mt-3 flex items-center gap-3">
            <span className="text-xl font-bold">{formatHours(j.totalHours, locale)}</span>
            <StatusStamp status={j.status} label={m.status[j.status]} />
          </span>
        </span>
        <MoveRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out group-open:rotate-90 rtl:rotate-180 rtl:group-open:rotate-90" aria-hidden="true" />
      </summary>

      <div className="border-t px-5 pb-5">
        <div className="flex gap-3 border-b py-4">
          {/* The carrier's mark stands in for the plane icon when there is one. */}
          {j.airline ? (
            <span className="size-8 shrink-0 rounded-full border bg-background p-1">
              <AirlineLogo code={j.airline} />
            </span>
          ) : (
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
              {j.mode === "air" ? <Plane className="size-4" /> : <Car className="size-4" />}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{operator}</p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {m.to} {j.entryData.name[locale]} · {formatHours(j.hours, locale)}
            </p>
            {j.note && <p className="mt-1.5 text-[13px] leading-relaxed">{j.note[locale]}</p>}
            <Provenance confidence={j.confidence} source={j.source} seen={j.seen} locale={locale} m={m} />
          </div>
        </div>

        <div className="flex gap-3 py-4">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
            <ArrowRight className="size-4 rtl:rotate-180" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">
              {m.road} · {j.entryData.name[locale]} → {city.name[locale]}
            </p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">{formatHours(j.roadHours, locale)}</p>
            {j.entryData.note && <p className="mt-1.5 text-[13px] leading-relaxed">{j.entryData.note[locale]}</p>}
            <Provenance source="est" locale={locale} m={m} />
          </div>
        </div>

        <div className="rounded-xl bg-muted px-4 py-3">
          <p className="text-[13px] font-semibold">{m.need}</p>
          <ul className="mt-2 flex list-disc flex-col gap-2.5 ps-4 text-[13.5px] leading-relaxed">
            {needs.map((n, i) => (
              <li key={i}>
                {n.text[locale]}
                <Provenance source={n.source} locale={locale} m={m} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  )
}
