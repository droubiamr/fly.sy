"use client"

import { PASSPORTS } from "@/lib/data"
import type { Journey } from "@/lib/plan"
import type { Locale, Passport } from "@/lib/types"
import { count, type Messages } from "@/messages"
import { usePassport } from "@/components/passport-state"
import { RouteCard } from "@/components/route-card"
import { cn } from "@/lib/utils"

/**
 * The ranked routes for the chosen passport, under a line that repeats the
 * search in words. All three answers arrive with the page; this only picks one.
 */
export function RouteResults({
  journeys,
  dest,
  originName,
  cityName,
  locale,
  m,
}: {
  journeys: Record<Passport, Journey[]>
  dest: string
  originName: string
  cityName: string
  locale: Locale
  m: Messages
}) {
  const { passport } = usePassport()
  const list = journeys[passport]
  const passportName = PASSPORTS.find((p) => p.id === passport)!.name[locale]
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-secondary px-4 py-3">
        <div className="min-w-0">
          <p className="text-[15px] text-secondary-foreground">{m.search.yours}</p>
          <p className="text-[17px] font-bold leading-snug">
            {m.fromCity} {originName} · {passportName} · {m.to} {cityName}
          </p>
        </div>
        <a href="#plan" className="inline-flex h-11 shrink-0 items-center rounded-xl border-[1.5px] border-input bg-card px-4 text-base font-semibold">
          {m.search.change}
        </a>
      </div>
      <p className="text-base text-muted-foreground">
        {count(list.length, m.routesCount)} {list.length > 1 && m.fastestFirst} {m.estimates}
      </p>
      {list.length === 0 ? (
        <p className="rounded-2xl border-[1.5px] bg-card p-5 text-lg text-muted-foreground">{m.routesEmpty}</p>
      ) : (
        <ol className="flex flex-col gap-4 pt-1">
          {list.map((j, i) => (
            <li key={`${j.entry}-${j.airline ?? j.city.en}-${i}`}>
              <RouteCard journey={j} dest={dest} passport={passport} rank={i + 1} locale={locale} m={m} />
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

/** The three passports as big bordered buttons; the current one is filled. Same page, no navigation. */
export function PassportChips({ locale }: { locale: Locale }) {
  const { passport, setPassport } = usePassport()
  return (
    <ul className="mt-3 flex flex-col gap-2">
      {PASSPORTS.map((p) => (
        <li key={p.id}>
          <button
            type="button"
            aria-pressed={p.id === passport}
            onClick={() => setPassport(p.id)}
            className={cn(
              "flex min-h-14 w-full items-center rounded-xl border-2 px-4 text-start text-[17px] font-semibold transition-colors duration-100 ease-out",
              p.id === passport ? "border-primary bg-secondary text-secondary-foreground" : "border-input bg-card",
            )}
          >
            {p.name[locale]}
          </button>
        </li>
      ))}
    </ul>
  )
}
