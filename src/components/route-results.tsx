"use client"

import { PASSPORTS } from "@/lib/data"
import type { Journey } from "@/lib/plan"
import type { Locale, Passport } from "@/lib/types"
import type { Messages } from "@/messages"
import { usePassport } from "@/components/passport-state"
import { RouteCard } from "@/components/route-card"
import { cn } from "@/lib/utils"

/** The ranked routes for the chosen passport. All three answers arrive with the page; this only picks one. */
export function RouteResults({ journeys, dest, locale, m }: { journeys: Record<Passport, Journey[]>; dest: string; locale: Locale; m: Messages }) {
  const { passport } = usePassport()
  const list = journeys[passport]
  if (list.length === 0) return <p className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">{m.routesEmpty}</p>
  return (
    <ol className="flex flex-col gap-2.5">
      {list.map((j, i) => (
        <li key={`${j.entry}-${j.airline ?? j.city.en}-${i}`}>
          <RouteCard journey={j} dest={dest} passport={passport} rank={i + 1} locale={locale} m={m} />
        </li>
      ))}
    </ol>
  )
}

/** The three passports as chips; the current one is filled. Same page, no navigation. */
export function PassportChips({ locale }: { locale: Locale }) {
  const { passport, setPassport } = usePassport()
  return (
    <ul className="mt-2 flex flex-wrap gap-2">
      {PASSPORTS.map((p) => (
        <li key={p.id}>
          <button
            type="button"
            aria-pressed={p.id === passport}
            onClick={() => setPassport(p.id)}
            className={cn(
              "inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium transition-colors duration-100 ease-out",
              p.id === passport ? "bg-foreground text-background" : "bg-muted",
            )}
          >
            {p.name[locale]}
          </button>
        </li>
      ))}
    </ul>
  )
}
