"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { localePath, routeHref } from "@/lib/site"
import type { Origin, Passport, Region, Text } from "@/lib/types"
import type { Reach } from "@/lib/plan"
import { cn } from "@/lib/utils"
import { useLocale, useMessages } from "@/components/messages-provider"
import { passportQuery, usePassport } from "@/components/passport-state"
import { Flag } from "@/components/flag"
import { signClass } from "@/components/sign"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"

export type PlannerOrigin = { id: Origin; name: Text; region: Region; slug: string }
export type PlannerDest = { id: string; entry: string; name: Text }

// A choice set in white on the green sign, the size of a place name on a road sign.
const trigger =
  "h-12 w-full min-w-0 justify-between gap-2 rounded-md border-0 bg-transparent px-1.5 text-start text-[21px] font-bold text-primary-foreground shadow-none" +
  " hover:bg-primary-foreground/10 focus-visible:ring-primary-foreground/50 dark:bg-transparent dark:hover:bg-primary-foreground/10 data-[size=default]:h-12" +
  " [&_svg:not([class*='text-'])]:text-primary-foreground [&>svg]:size-5"

/**
 * The question, as a sign: where you are, where you are going. Every answer is
 * its own page (/from/…/to/…), so a choice is a navigation. The lists arrive as
 * props so the site's data never ships to the phone.
 */
export function Planner({
  from,
  dest,
  reach,
  origins,
  destinations,
  regions,
}: {
  from: Origin
  dest: string
  /** Per passport, per airport code: reachable direct, only with a connection, or not at all (greyed out). */
  reach: Record<Passport, Record<string, Reach>>
  origins: PlannerOrigin[]
  destinations: PlannerDest[]
  regions: Region[]
}) {
  const router = useRouter()
  const locale = useLocale()
  const m = useMessages()
  const { passport } = usePassport()
  const [pending, start] = useTransition()
  const slugOf = (id: Origin) => origins.find((o) => o.id === id)?.slug ?? ""

  const go = (next: { from?: Origin; dest?: string }) => {
    const href = localePath(locale, routeHref(slugOf(next.from ?? from), next.dest ?? dest)) + passportQuery(passport)
    start(() => router.push(href, { scroll: false }))
  }

  return (
    <div className={cn(signClass(), "px-4 py-1.5 transition-opacity duration-200 ease-out", pending && "opacity-80")}>
      <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-2 py-1.5">
        <span className="text-sm opacity-85">{m.ask.fromLabel}</span>
        <Select value={from} onValueChange={(v) => go({ from: v })}>
          <SelectTrigger className={trigger} aria-label={m.ask.in}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {regions.map((r) => (
              <SelectGroup key={r}>
                <SelectLabel>{m.regions[r]}</SelectLabel>
                {origins
                  .filter((o) => o.region === r)
                  .map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      <Flag code={o.id} className="h-3.5" /> {o.name[locale]}
                    </SelectItem>
                  ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-2 border-t-2 border-primary-foreground/70 py-1.5">
        <span className="text-sm opacity-85">{m.ask.toLabel}</span>
        <Select value={dest} onValueChange={(v) => go({ dest: v })}>
          <SelectTrigger className={trigger} aria-label={m.ask.to}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {destinations.map((d) => (
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
      </div>
    </div>
  )
}
