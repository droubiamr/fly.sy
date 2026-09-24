import Link from "next/link"
import { Plane, Car, Clock, ChevronDown, SquareCheck } from "lucide-react"
import { DATA, airlinePath, cityById, entryPath } from "@/lib/data"
import { localePath } from "@/lib/site"
import { formatHours } from "@/lib/format"
import type { Journey } from "@/lib/plan"
import type { Locale, Passport } from "@/lib/types"
import type { Messages } from "@/messages"
import { StatusStamp } from "@/components/status-stamp"
import { Provenance } from "@/components/provenance"
import { AirlineLogo } from "@/components/airline-logo"
import { cn } from "@/lib/utils"

function Step({ n, title, last, children }: { n: number; title: string; last?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex gap-3.5">
      <div className="flex flex-col items-center">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground">{n}</span>
        {!last && <span className="my-1.5 w-[3px] flex-1 rounded-full bg-border" aria-hidden="true" />}
      </div>
      <div className={cn("min-w-0 flex-1", !last && "pb-6")}>
        <p className="text-base font-bold text-primary">{title}</p>
        {children}
      </div>
    </div>
  )
}

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
  const entry = j.entryData.name[locale]
  const href = (x: string) => localePath(locale, x)
  // The card leads with the name a traveller would search for: the airline, or
  // the crossing when it is a road trip.
  const name = airline ? airline.name[locale] : `${m.overlandVia} ${entry}`
  const route = airline ? `${m.fromCity} ${j.city[locale]} ${m.to} ${entry}` : `${m.fromCity} ${j.city[locale]} ${m.to} ${city.name[locale]}`
  const needs = DATA.needs[j.entryData.kind][passport]
  // "Fastest" only when the route is known to run: the quickest line on paper is
  // often the one nobody has seen fly, and the tag would vouch for it.
  const fastest = rank === 1 && !j.blocked && j.totalHours != null && j.status === "open"
  const link = "underline decoration-muted-foreground/40 underline-offset-[3px] hover:decoration-current"

  const mark = j.airline ? (
    <span className="size-12 shrink-0 rounded-full border-[1.5px] bg-background p-1.5">
      <AirlineLogo code={j.airline} />
    </span>
  ) : (
    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
      {j.mode === "air" ? <Plane className="size-6" /> : <Car className="size-6" />}
    </span>
  )

  const head = (
    <>
      <div className="flex items-center gap-3">
        {mark}
        <div className="min-w-0 flex-1">
          <p className="text-xl font-bold leading-snug">{name}</p>
          <p className="mt-0.5 text-[17px] leading-snug text-muted-foreground">{route}</p>
        </div>
      </div>
      <div className="mt-3.5 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-lg font-bold">
          <Clock className="size-6 shrink-0 text-primary" aria-hidden="true" />
          {formatHours(j.totalHours, locale)}
        </span>
        {j.blocked ? <StatusStamp status="closed" label={m.blocked} /> : <StatusStamp status={j.status} label={m.status[j.status]} />}
      </div>
    </>
  )

  if (j.blocked) {
    return (
      <div className="rounded-2xl border-[1.5px] bg-card px-4 py-4 opacity-80">
        {head}
        <p className="mt-3 text-[17px] leading-relaxed text-destructive">{m.blockedWhy}</p>
      </div>
    )
  }

  return (
    <details className={cn("group relative rounded-2xl border-[1.5px] bg-card", fastest && "border-2 border-primary")}>
      {fastest && (
        <span className="absolute -top-3.5 start-4 rounded-lg bg-primary px-3 py-0.5 text-sm font-bold text-primary-foreground">{m.fastest}</span>
      )}
      {/* The whole top of the card opens it, but the button at its foot is what
          says so. A 16px chevron in the corner told nobody anything. */}
      <summary className="cursor-pointer list-none rounded-2xl px-4 pt-5 pb-4 transition-colors duration-100 ease-out active:bg-muted [&::-webkit-details-marker]:hidden">
        {head}
        <span
          className="mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-xl border-2 border-primary text-lg font-bold text-primary"
          aria-hidden="true"
        >
          <span className="group-open:hidden">{m.details}</span>
          <span className="hidden group-open:inline">{m.hideDetails}</span>
          <ChevronDown className="size-6 transition-transform duration-200 ease-out group-open:rotate-180" strokeWidth={2.6} />
        </span>
      </summary>

      <div className="border-t-[1.5px] px-4 pt-5 pb-5">
        <Step n={1} title={m.steps[j.mode === "air" ? "fly" : "drive"]}>
          <p className="mt-0.5 text-lg font-bold leading-snug">
            {airline && j.airline ? (
              <>
                <Link href={href(airlinePath(j.airline))} className={link}>
                  {airline.name[locale]}
                </Link>{" "}
                {m.fromCity} {j.city[locale]} {m.to}{" "}
              </>
            ) : (
              <>
                {m.fromCity} {j.city[locale]} {m.to}{" "}
              </>
            )}
            <Link href={href(entryPath(j.entry))} className={link}>
              {entry}
            </Link>
          </p>
          <p className="mt-1.5 flex items-center gap-2 text-[17px]">
            <Clock className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            {formatHours(j.hours, locale)}
          </p>
          {j.note && <p className="mt-2 text-base leading-relaxed">{j.note[locale]}</p>}
          <Provenance confidence={j.confidence} source={j.source} seen={j.seen} locale={locale} m={m} />
        </Step>

        <Step n={2} title={m.steps.drive}>
          <p className="mt-0.5 text-lg font-bold leading-snug">
            {m.fromCity} {entry} {m.to} {city.name[locale]}
          </p>
          <p className="mt-1.5 flex items-center gap-2 text-[17px]">
            <Clock className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            {formatHours(j.roadHours, locale)} {m.byCar}
          </p>
          {j.entryData.note && <p className="mt-2 text-base leading-relaxed">{j.entryData.note[locale]}</p>}
          <Provenance source="est" locale={locale} m={m} />
        </Step>

        <Step n={3} title={m.steps.need} last>
          <ul className="mt-2 flex flex-col gap-4">
            {needs.map((n, i) => (
              <li key={i} className="flex gap-3">
                <SquareCheck className="mt-0.5 size-7 shrink-0 text-primary" strokeWidth={2} aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-base leading-relaxed">{n.text[locale]}</p>
                  <Provenance source={n.source} locale={locale} m={m} />
                </div>
              </li>
            ))}
          </ul>
        </Step>
      </div>
    </details>
  )
}
