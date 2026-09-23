"use client"

import type { Journey } from "@/lib/plan"
import type { Locale, Passport } from "@/lib/types"
import type { Messages } from "@/messages"
import { usePassport } from "@/components/passport-state"
import { useMessages } from "@/components/messages-provider"
import { RouteCard } from "@/components/route-card"
import { SURFACE } from "@/components/page"
import { cn } from "@/lib/utils"

const PASSPORTS: Passport[] = ["sy", "voa", "res"]

/** The ranked routes for the chosen passport. All three answers arrive with the page; this only picks one. */
export function RouteResults({ journeys, dest, locale, m }: { journeys: Record<Passport, Journey[]>; dest: string; locale: Locale; m: Messages }) {
  const { passport } = usePassport()
  const list = journeys[passport]
  // The list is already sorted by total time. The badge goes to the first route
  // that is known to run: a faster line nobody has confirmed does not earn it.
  const fastest = list.findIndex((j) => !j.blocked && j.status === "open" && j.totalHours != null)
  if (list.length === 0) return <p className={cn(SURFACE, "p-5 text-sm text-muted-foreground")}>{m.routesEmpty}</p>
  return (
    <ol className="flex flex-col gap-3">
      {list.map((j, i) => (
        <li key={`${j.entry}-${j.airline ?? j.city.en}-${i}`}>
          <RouteCard journey={j} dest={dest} passport={passport} fastest={i === fastest} locale={locale} m={m} />
        </li>
      ))}
    </ol>
  )
}

/**
 * The three passports as Linkat's segmented control: a muted pill track with
 * the chosen option filled in the text colour. Same page, no navigation; the
 * planner's passport word changes with it, since both read one store.
 */
export function PassportSwitch({ label, className }: { label: string; className?: string }) {
  const { passport, setPassport } = usePassport()
  const m = useMessages()
  return (
    <div role="group" aria-label={label} className={cn("grid grid-cols-3 rounded-full bg-muted p-1", className)}>
      {PASSPORTS.map((p) => (
        <button
          key={p}
          type="button"
          aria-pressed={p === passport}
          onClick={() => setPassport(p)}
          className={cn(
            "min-h-10 rounded-full px-2 text-[13px] leading-tight font-medium transition-colors duration-150 ease-out",
            p === passport ? "bg-foreground/85 text-background" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {m.reports.form.passports[p]}
        </button>
      ))}
    </div>
  )
}
