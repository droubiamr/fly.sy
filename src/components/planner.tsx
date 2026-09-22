"use client"

import { useRouter, usePathname } from "next/navigation"
import { useTransition } from "react"
import { DATA, ORIGINS, PASSPORTS } from "@/lib/data"
import type { Origin, Passport } from "@/lib/types"
import { useLocale, useMessages } from "@/components/messages-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const trigger =
  "relative inline-flex h-auto w-auto gap-1.5 rounded-[10px] border-0 bg-secondary px-3 py-1 text-[inherit] font-bold text-secondary-foreground shadow-none data-[size=default]:h-auto" +
  // The chip reads as part of the sentence, so it stays small. The tappable
  // area is grown to 44px behind it, and the line height is opened up enough
  // that the areas on neighbouring lines cannot overlap.
  " after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-['']"

/** The sentence you fill in. Choices live in the URL so any answer is a link. */
export function Planner({ from, dest, passport }: { from: Origin; dest: string; passport: Passport }) {
  const router = useRouter()
  const path = usePathname()
  const locale = useLocale()
  const m = useMessages()
  const [pending, start] = useTransition()

  const set = (key: "from" | "to" | "p", value: string) => {
    const q = new URLSearchParams({ from, to: dest, p: passport })
    q.set(key, value)
    start(() => router.replace(`${path}?${q}`, { scroll: false }))
  }

  return (
    <div className={cn("rounded-2xl border bg-card px-5 py-4 transition-opacity duration-200 ease-out", pending && "opacity-70")}>
      <p className="text-[21px] font-semibold leading-[2.2] tracking-tight">
        {m.ask.in}{" "}
        <Select value={from} onValueChange={(v) => set("from", v)}>
          <SelectTrigger className={trigger} aria-label={m.ask.in}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORIGINS.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.name[locale]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>{" "}
        {m.ask.with}{" "}
        <Select value={passport} onValueChange={(v) => set("p", v)}>
          <SelectTrigger className={trigger} aria-label={m.ask.with}>
            <SelectValue />
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
        <Select value={dest} onValueChange={(v) => set("to", v)}>
          <SelectTrigger className={trigger} aria-label={m.ask.to}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATA.cities.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name[locale]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </p>
    </div>
  )
}
