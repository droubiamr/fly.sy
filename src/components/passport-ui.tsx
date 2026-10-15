"use client"

import { useEffect, useRef } from "react"
import type { Passport } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useMessages } from "@/components/messages-provider"
import { usePassport } from "@/components/passport-state"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

/*
 * The passport is the one thing on a route page that changes on the phone. The
 * page is rendered once, for a Syrian passport; these pieces read ?p= and
 * adjust what is already there, so switching costs no request.
 */

const PASSPORTS: Passport[] = ["sy", "voa", "res"]

/** The three passports as sign plates under the question. */
export function PassportPlates() {
  const m = useMessages()
  const { passport, setPassport } = usePassport()
  return (
    <div className="flex flex-col gap-1.5">
      <p id="pp-label" className="text-sm text-muted-foreground">
        {m.ask.passportLabel}
      </p>
      <ToggleGroup
        type="single"
        value={passport}
        onValueChange={(v) => v && setPassport(v as Passport)}
        aria-labelledby="pp-label"
        spacing={1.5}
        className="grid w-full grid-cols-[0.8fr_1.3fr_1.1fr]"
      >
        {PASSPORTS.map((p) => (
          <ToggleGroupItem
            key={p}
            value={p}
            className={cn(
              "h-12 w-full rounded-lg px-1.5 text-[13px] leading-tight font-semibold whitespace-normal",
              "bg-card text-primary shadow-[inset_0_0_0_2px_var(--primary)] hover:bg-secondary hover:text-primary",
              "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-[inset_0_0_0_3px_var(--primary),inset_0_0_0_4.5px_var(--primary-foreground)]",
            )}
          >
            {m.reports.form.passports[p]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

/** The page's one-line answer for the chosen passport. All three arrive with the page; the Syrian one is in the HTML crawlers read. */
export function AnswerLine({ answers }: { answers: Record<Passport, string> }) {
  const { passport } = usePassport()
  return <p className="max-w-prose text-[15px] leading-relaxed">{answers[passport]}</p>
}

/** Content for one passport. Every passport's version is in the HTML; the others are hidden, like closed tabs. */
export function OnlyFor({ passport, children }: { passport: Passport; children: React.ReactNode }) {
  const current = usePassport().passport
  return <div hidden={current !== passport}>{children}</div>
}

/**
 * One way on a route page, for the passport chosen. A way that only Syrians
 * (and Turks) may take drops to the end of the list for any other passport,
 * greyed, and its sign shows the plate that says why (`group-data-[blocked]/way`);
 * a crossing not confirmed for foreigners shows its plate (`group-data-[unsure]/way`).
 * The main sign, open with its legs and airlines, follows the passport too:
 * `main` lists the passports this way is main for, `fastest` those it is the
 * answer for, and the sign reads them as `group-data-[main]/way` and
 * `group-data-[fastest]/way`.
 */
export function WayGate({
  syriansOnly,
  unconfirmed,
  main,
  fastest,
  children,
}: {
  syriansOnly: boolean
  unconfirmed: boolean
  main: Passport[]
  fastest: Passport[]
  children: React.ReactNode
}) {
  const { passport } = usePassport()
  const blocked = syriansOnly && passport !== "sy"
  const isMain = main.includes(passport)
  const ref = useRef<HTMLLIElement>(null)
  // A main sign opens when its passport is chosen and closes when another one is; a sign that is never main stays as
  // the reader left it.
  useEffect(() => {
    const d = ref.current?.firstElementChild
    if (main.length && d instanceof HTMLDetailsElement) d.open = isMain
  }, [isMain, main.length])
  return (
    <li
      ref={ref}
      data-blocked={blocked || undefined}
      data-unsure={(unconfirmed && passport !== "sy") || undefined}
      data-main={isMain || undefined}
      data-fastest={fastest.includes(passport) || undefined}
      className={cn("group/way", blocked && "order-last opacity-70")}
    >
      {children}
    </li>
  )
}

/** Part of the route map that only Syrians can use: a crossing closed to other passports, hidden for them. */
export function SyriansOnlyMark({ children }: { children: React.ReactNode }) {
  const { passport } = usePassport()
  return <g display={passport === "sy" ? undefined : "none"}>{children}</g>
}
