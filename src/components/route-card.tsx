import Link from "next/link"
import { ArrowRight, Ban, Car, ChevronDown, ClipboardList, Plane, Zap } from "lucide-react"
import { DATA, airlinePath, cityById, entryPath } from "@/lib/data"
import { localePath } from "@/lib/site"
import { arrow, formatHours } from "@/lib/format"
import type { Journey } from "@/lib/plan"
import type { Locale, Passport } from "@/lib/types"
import type { Messages } from "@/messages"
import { StatusStamp } from "@/components/status-stamp"
import { Provenance } from "@/components/provenance"
import { AirlineLogo } from "@/components/airline-logo"

/** The carrier's mark, or the mode's icon when the leg has no carrier. */
function LegMark({ journey: j, className = "" }: { journey: Journey; className?: string }) {
  if (j.airline)
    return (
      <span className={"size-9 shrink-0 rounded-full border bg-background p-1.5 " + className}>
        <AirlineLogo code={j.airline} />
      </span>
    )
  return (
    <span className={"grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground " + className}>
      {j.mode === "air" ? <Plane className="size-4" aria-hidden="true" /> : <Car className="size-4" aria-hidden="true" />}
    </span>
  )
}

/**
 * One ranked journey. Two layers only: the closed card is the answer (where
 * from, where it lands, how long, whether it runs), and one tap opens the
 * legs, their sources and the documents. The control that opens it says so.
 */
export function RouteCard({
  journey: j,
  dest,
  passport,
  fastest,
  locale,
  m,
}: {
  journey: Journey
  dest: string
  passport: Passport
  /** The first journey with a known total time wears the "fastest" stamp. */
  fastest: boolean
  locale: Locale
  m: Messages
}) {
  const city = cityById(dest)!
  const airline = j.airline ? DATA.airlines[j.airline] : null
  const needs = DATA.needs[j.entryData.kind][passport]
  // The headline is the leg the reader books: their city to the airport or
  // crossing. The road on to the destination city is a leg in the details.
  const headline = (
    <>
      {j.city[locale]} {arrow(locale)} {j.entryData.name[locale]}
    </>
  )
  const carrier = airline ? airline.name[locale] : m.mode[j.mode]

  if (j.blocked) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border bg-card px-5 py-4 opacity-70">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-status-closed">
          <Ban className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{headline}</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{carrier}</p>
          <p className="mt-2 text-[13px] text-destructive">{m.blockedWhy}</p>
        </div>
        <StatusStamp status="closed" label={m.blocked} />
      </div>
    )
  }

  return (
    <details className="group rounded-2xl border bg-card open:bg-card">
      {/* A full-width row answers a press the way a native list row does, with a
          background, not a scale. */}
      <summary className="cursor-pointer list-none rounded-2xl px-5 py-4 transition-colors duration-100 ease-out active:bg-muted [&::-webkit-details-marker]:hidden">
        <span className="flex items-start gap-3">
          <LegMark journey={j} />
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">{headline}</span>
            <span className="mt-0.5 flex items-center gap-2 text-[13px] text-muted-foreground">
              <span className="truncate">{carrier}</span>
              {fastest && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-md border-[1.5px] border-primary px-1.5 py-0.5 text-[11px] font-bold tracking-wide text-primary">
                  <Zap className="size-3" aria-hidden="true" />
                  {m.fastest}
                </span>
              )}
            </span>
          </span>
          <span className="flex shrink-0 flex-col items-end gap-1.5">
            <span className="text-xl font-bold leading-none">{formatHours(j.totalHours, locale)}</span>
            <StatusStamp status={j.status} label={m.status[j.status]} />
          </span>
        </span>
        {/* The control says what it opens, so the reader knows before tapping. */}
        <span className="mt-3 flex items-center gap-1 text-[13px] font-medium text-primary">
          <ChevronDown className="size-4 transition-transform duration-200 ease-out group-open:rotate-180" aria-hidden="true" />
          {m.more}
        </span>
      </summary>

      <div className="border-t px-5 pb-5">
        <ol>
          <li className="flex gap-3 border-b py-4">
            <LegMark journey={j} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {airline && j.airline ? (
                  <Link href={localePath(locale, airlinePath(j.airline))} className="underline-offset-4 hover:underline">
                    {airline.name[locale]}
                  </Link>
                ) : (
                  m.mode[j.mode]
                )}{" "}
                · {formatHours(j.hours, locale)}
              </p>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {j.city[locale]} {arrow(locale)}{" "}
                <Link href={localePath(locale, entryPath(j.entry))} className="underline-offset-4 hover:underline">
                  {j.entryData.name[locale]}
                </Link>
              </p>
              {j.note && <p className="mt-1.5 text-[13px] leading-relaxed">{j.note[locale]}</p>}
              {/* A crossing's note changes what you do (the wait, who may cross), so it
                  rides along. An airport's is commentary, and lives on its own page. */}
              {j.mode === "land" && j.entryData.note && <p className="mt-1.5 text-[13px] leading-relaxed">{j.entryData.note[locale]}</p>}
              <Provenance confidence={j.confidence} source={j.source} seen={j.seen} locale={locale} m={m} />
            </div>
          </li>

          <li className="flex gap-3 py-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
              <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {m.road} · {formatHours(j.roadHours, locale)}
              </p>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {j.entryData.name[locale]} {arrow(locale)} {city.name[locale]}
              </p>
              <Provenance source="est" locale={locale} m={m} />
            </div>
          </li>
        </ol>

        <div className="rounded-xl bg-muted px-4 py-3">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold">
            <ClipboardList className="size-4" aria-hidden="true" />
            {m.need}
          </p>
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
