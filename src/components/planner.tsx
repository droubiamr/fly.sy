"use client"

import { useRouter } from "next/navigation"
import { passportQuery, usePassport } from "@/components/passport-state"
import { useTransition } from "react"
import { DESTINATIONS, ORIGINS, PASSPORTS, REGIONS, routePath } from "@/lib/data"
import { localePath } from "@/lib/site"
import type { Origin, Passport } from "@/lib/types"
import type { Reach } from "@/lib/plan"
import { useLocale, useMessages } from "@/components/messages-provider"
import { Flag } from "@/components/flag"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const trigger =
  // No chip: the choice reads as a word in the sentence, set in the accent
  // colour so the chevron and colour alone say it is tappable. Size and weight
  // are inherited (with type hints, so tailwind-merge drops the base text-sm and
  // font-medium) and the labels and choices read as one sentence in one face.
  "relative inline-block h-auto w-auto rounded-md border-0 bg-transparent px-0.5 py-0 text-[length:inherit] font-[weight:inherit] text-primary shadow-none hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent data-[size=default]:h-auto" +
  // Never wider than the card. The base trigger is nowrap, and a long choice
  // ("a passport needing pre-approval", or the Arabic visa-on-arrival wording
  // on a 360px phone) then runs past the edge; the phone widens its layout
  // viewport to fit it, and the whole page can be dragged sideways. Instead
  // the choice is laid out as text inside the button, so it wraps like the
  // rest of the sentence. Only the value is allowed to wrap; the button stays
  // nowrap, and GLUE below keeps the chevron on the last word's line.
  " max-w-full text-start *:data-[slot=select-value]:inline *:data-[slot=select-value]:whitespace-normal [&_svg]:inline-block [&_svg]:align-middle [&>svg]:ms-1" +
  // The tappable area is grown to 44px behind the word, and the line height
  // is opened up enough that the areas on neighbouring lines cannot overlap.
  " after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-['']"

// U+2060 WORD JOINER between the value and the chevron. Browsers allow a line
// break before an inline SVG whatever the white-space around it, so on a
// narrow phone the chevron would drop to a line of its own; the joiner forbids
// a break on either side of itself, and the chevron stays with the last word.
const GLUE = "\u2060"

/** The sentence you fill in. Every answer is its own page (/from/…/to/…), so any answer is a link. */
export function Planner({
  from,
  dest,
  reach,
}: {
  from: Origin
  dest: string
  /** Per passport, per airport code: reachable direct, only with a connection, or not at all (greyed out). */
  reach: Record<Passport, Record<string, Reach>>
}) {
  const router = useRouter()
  const locale = useLocale()
  const m = useMessages()
  const { passport, setPassport } = usePassport()
  const [pending, start] = useTransition()

  // Origin and destination are pages; the passport is state on the page, so
  // changing it swaps the answer in place without fetching anything.
  const go = (next: { from?: Origin; dest?: string }) => {
    const href = localePath(locale, routePath(next.from ?? from, next.dest ?? dest)) + passportQuery(passport)
    start(() => router.push(href, { scroll: false }))
  }

  return (
    <div className={cn("rounded-2xl border bg-card px-5 py-4 transition-opacity duration-200 ease-out", pending && "opacity-70")}>
      <p className="text-[21px] font-semibold leading-[2.2] tracking-tight">
        {m.ask.in}{" "}
        <Select value={from} onValueChange={(v) => go({ from: v })}>
          <SelectTrigger className={trigger} aria-label={m.ask.in}>
            <SelectValue />
            {GLUE}
          </SelectTrigger>
          <SelectContent>
            {REGIONS.map((r) => (
              <SelectGroup key={r}>
                <SelectLabel>{m.regions[r]}</SelectLabel>
                {ORIGINS.filter((o) => o.region === r).map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {/* The flag rides inside ItemText, so the closed chip shows it too. */}
                    <Flag code={o.id} className="h-3.5" />
                    {/* A real space: the list row is a flex box and drops it, the
                        closed trigger is inline text and needs it. */}
                    {" "}
                    {o.name[locale]}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>{" "}
        {m.ask.with}{" "}
        <Select value={passport} onValueChange={(v) => setPassport(v as Passport)}>
          <SelectTrigger className={trigger} aria-label={m.ask.with}>
            <SelectValue />
            {GLUE}
          </SelectTrigger>
          <SelectContent>
            {PASSPORTS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name[locale]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>{" "}
        {m.ask.to}{" "}
        <Select value={dest} onValueChange={(v) => go({ dest: v })}>
          <SelectTrigger className={trigger} aria-label={m.ask.to}>
            <SelectValue />
            {GLUE}
          </SelectTrigger>
          <SelectContent>
            {DESTINATIONS.map((d) => (
              <SelectItem key={d.id} value={d.id} disabled={reach[passport][d.entry] === "none"} hint={reach[passport][d.entry] === "via" ? m.ask.via : undefined}>
                {d.name[locale]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </p>
    </div>
  )
}
