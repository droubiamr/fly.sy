"use client"

import { useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowDownUp } from "lucide-react"
import { localePath, routeHref } from "@/lib/site"
import { fmt } from "@/lib/text"
import type { Direction, Origin, Passport, Region, Text } from "@/lib/types"
import type { Reach } from "@/lib/plan"
import { cn } from "@/lib/utils"
import { useLocale, useMessages } from "@/components/messages-provider"
import { passportQuery, usePassport } from "@/components/passport-state"
import { Flag } from "@/components/flag"
import { signClass } from "@/components/sign"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"

export type PlannerOrigin = { id: Origin; name: Text; region: Region; slug: string }
export type PlannerDest = { id: string; entry: string; name: Text; city: Text }

// A choice set in white on the green sign, the size of a place name on a road sign. The value stops short of the
// swap button that sits on the line between the two rows, and ends in an ellipsis if it is longer.
const trigger =
  "h-12 w-full min-w-0 justify-between gap-2 rounded-md border-0 bg-transparent px-1.5 text-start text-[21px] font-bold text-primary-foreground shadow-none" +
  " hover:bg-primary-foreground/10 focus-visible:ring-primary-foreground/50 dark:bg-transparent dark:hover:bg-primary-foreground/10 data-[size=default]:h-12" +
  " [&_svg:not([class*='text-'])]:text-primary-foreground [&>svg]:size-5" +
  " *:data-[slot=select-value]:block *:data-[slot=select-value]:max-w-[calc(100%-5rem)] *:data-[slot=select-value]:truncate" +
  // A flag on the green sign gets a white edge: Saudi Arabia's green field would otherwise vanish into it.
  " [&_[data-flag]]:border-primary-foreground"

/**
 * The question, as a sign: where you are, where you are going. Every answer is
 * its own page, so a choice is a navigation: /from/turkiye/to/damascus into
 * Syria, /from/damascus/to/turkiye out of it. The round button on the line
 * between the rows is a link to the same pair the other way. The From list
 * carries both kinds of place, Syria's airports first: picking one turns the
 * question around, so someone in Damascus finds their city without knowing the
 * button. The lists arrive as props so the site's data never ships to the phone.
 */
export function Planner({
  dir,
  country,
  city,
  reach,
  leaveReach,
  origins,
  destinations,
  regions,
}: {
  dir: Direction
  /** The country at the other end of the trip. */
  country: Origin
  /** The Syrian city, as its id. */
  city: string
  /** Into Syria: per passport, per airport code: reachable direct, only with a connection, or not at all (greyed out). */
  reach: Record<Passport, Record<string, Reach>>
  /** Out of Syria: per country, whether any way out to it is known (greyed out when not). */
  leaveReach: Record<Origin, boolean>
  origins: PlannerOrigin[]
  destinations: PlannerDest[]
  regions: Region[]
}) {
  const router = useRouter()
  const locale = useLocale()
  const m = useMessages()
  const { passport } = usePassport()
  const [pending, start] = useTransition()
  const out = dir === "out"
  const slugOf = (id: Origin) => origins.find((o) => o.id === id)?.slug ?? ""
  const isCity = (v: string) => destinations.some((d) => d.id === v)

  // Into Syria keeps the passport; out of it there is no passport choice.
  const inHref = (c: Origin, ci: string) => localePath(locale, routeHref(slugOf(c), ci)) + passportQuery(passport)
  const outHref = (ci: string, c: Origin) => localePath(locale, routeHref(ci, slugOf(c)))
  const go = (href: string) => start(() => router.push(href, { scroll: false }))

  // From: a country keeps the trip coming in, a Syrian city turns it round. The place you had becomes the other end.
  const pickFrom = (v: string) => go(isCity(v) ? outHref(v, country) : inHref(v, city))
  const pickTo = (v: string) => go(out ? outHref(city, v) : inHref(country, v))

  const countryName = origins.find((o) => o.id === country)?.name[locale] ?? ""
  const cityName = destinations.find((d) => d.id === city)?.city[locale] ?? ""
  const swap = out
    ? { href: inHref(country, city), label: fmt(m.ask.swap, { from: countryName, to: cityName }) }
    : { href: outHref(city, country), label: fmt(m.ask.swap, { from: cityName, to: countryName }) }

  const countryGroups = (disabled: (o: PlannerOrigin) => boolean) =>
    regions.map((r) => (
      <SelectGroup key={r}>
        <SelectLabel>{m.regions[r]}</SelectLabel>
        {origins
          .filter((o) => o.region === r)
          .map((o) => (
            <SelectItem key={o.id} value={o.id} disabled={disabled(o)}>
              <Flag code={o.id} className="h-3.5" /> {o.name[locale]}
            </SelectItem>
          ))}
      </SelectGroup>
    ))

  return (
    <div className={cn(signClass(), "px-4 py-1.5 transition-opacity duration-200 ease-out", pending && "opacity-80")}>
      <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-2 py-1.5">
        <span className="text-sm opacity-85">{m.ask.fromLabel}</span>
        <Select value={out ? city : country} onValueChange={pickFrom}>
          <SelectTrigger className={trigger} aria-label={m.ask.in}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {/* A trip out starts in a city, not at an airport: the way out may be a land crossing. */}
            <SelectGroup>
              <SelectLabel>{m.ask.inSyria}</SelectLabel>
              {destinations.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.city[locale]}
                </SelectItem>
              ))}
            </SelectGroup>
            {countryGroups(() => false)}
          </SelectContent>
        </Select>
      </div>
      <div className="relative grid grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-2 border-t-2 border-primary-foreground/70 py-1.5">
        <span className="text-sm opacity-85">{m.ask.toLabel}</span>
        <Select value={out ? country : city} onValueChange={pickTo}>
          <SelectTrigger className={trigger} aria-label={m.ask.to}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {out
              ? countryGroups((o) => !leaveReach[o.id])
              : destinations.map((d) => (
                  <SelectItem
                    key={d.id}
                    value={d.id}
                    disabled={reach[passport][d.entry] === "none"}
                    hint={reach[passport][d.entry] === "via" ? m.ask.via : undefined}
                  >
                    {d.name[locale]}
                  </SelectItem>
                ))}
          </SelectContent>
        </Select>
        {/* On the line between the two rows, towards the chevrons: the same pair the other way. A plain link to a
            prerendered page, so it works before the script loads and is prefetched like any other link. */}
        <Link
          href={swap.href}
          scroll={false}
          aria-label={swap.label}
          title={swap.label}
          className="absolute end-[12%] -top-[23px] grid size-11 place-items-center rounded-full bg-primary-foreground text-primary shadow-[0_0_0_3px_var(--primary)] transition-transform duration-150 ease-out outline-none hover:scale-105 focus-visible:ring-[3px] focus-visible:ring-primary-foreground/60 active:scale-95"
        >
          <ArrowDownUp className="size-[22px]" strokeWidth={2.4} aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
