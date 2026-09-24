"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { ChevronDown, MapPin, ShieldCheck, ArrowLeft, ArrowRight } from "lucide-react"
import { DESTINATIONS, ORIGINS, PASSPORTS, REGIONS, routePath } from "@/lib/data"
import { localePath } from "@/lib/site"
import type { Origin, Passport } from "@/lib/types"
import type { Reach } from "@/lib/plan"
import { passportQuery, usePassport } from "@/components/passport-state"
import { useLocale, useMessages } from "@/components/messages-provider"
import { Flag } from "@/components/flag"
import { cn } from "@/lib/utils"

// A native <select>, on purpose. The phone opens its own full-size picker, which
// every older user has met before, instead of a custom menu with small rows.
// The box is 64px tall with a visible border: it must look like a thing to tap.
const field =
  "h-16 w-full appearance-none rounded-xl border-2 border-input bg-card ps-[60px] pe-14 text-xl font-semibold text-foreground " +
  "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"

function Field({
  id,
  name,
  label,
  value,
  onChange,
  icon,
  children,
}: {
  id: string
  /** The query key, so a submit before hydration still builds a usable URL. */
  name: string
  label: string
  value: string
  onChange: (v: string) => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-lg font-semibold">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 start-4 flex items-center">{icon}</span>
        <select id={id} name={name} className={field} value={value} onChange={(e) => onChange(e.target.value)}>
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute inset-y-0 end-4 my-auto size-7 text-primary" strokeWidth={2.4} aria-hidden="true" />
      </div>
    </div>
  )
}

/**
 * Three questions and a button. Origin and destination are pages
 * (/from/…/to/…), the passport is state on the page carried in ?p=, so every
 * answer is a link. Nothing changes until the button is pressed: an older
 * reader wants to see cause and effect, not a page that shifts under a tap.
 */
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
  const [f, setF] = useState(from)
  const [p, setP] = useState<Passport>(passport)
  const [d, setD] = useState(dest)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setPassport(p)
    if (f === from && d === dest) {
      // Same page: the passport swaps the answer in place, no request.
      document.getElementById("routes")?.scrollIntoView({ behavior: "smooth", block: "start" })
      return
    }
    // A new page. The hash lands the reader on the answer once it renders; this
    // form is unmounted by then, so it cannot scroll the new page itself.
    start(() => router.push(localePath(locale, routePath(f, d)) + passportQuery(p) + "#routes"))
  }

  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight

  return (
    <form id="plan" onSubmit={submit} className="flex scroll-mt-4 flex-col gap-5">
      <Field id="from" name="from" label={m.ask.in} value={f} onChange={setF} icon={<Flag code={f} className="h-6 rounded-[4px]" />}>
        {REGIONS.map((r) => (
          <optgroup key={r} label={m.regions[r]}>
            {ORIGINS.filter((o) => o.region === r).map((o) => (
              <option key={o.id} value={o.id}>
                {o.name[locale]}
              </option>
            ))}
          </optgroup>
        ))}
      </Field>
      <Field
        id="passport"
        name="p"
        label={m.ask.with}
        value={p}
        onChange={(v) => setP(v as Passport)}
        icon={<ShieldCheck className="size-7 text-primary" strokeWidth={2} aria-hidden="true" />}
      >
        {PASSPORTS.map((x) => (
          <option key={x.id} value={x.id}>
            {x.name[locale]}
          </option>
        ))}
      </Field>
      <Field id="to" name="to" label={m.ask.to} value={d} onChange={setD} icon={<MapPin className="size-7 text-primary" strokeWidth={2} aria-hidden="true" />}>
        {DESTINATIONS.map((x) => {
          const r = reach[p][x.entry]
          return (
            <option key={x.id} value={x.id} disabled={r === "none"}>
              {x.name[locale]}
              {r === "via" ? ` (${m.ask.via})` : ""}
            </option>
          )
        })}
      </Field>
      <button
        type="submit"
        disabled={pending}
        className={cn(
          "mt-1 flex h-16 w-full items-center justify-center gap-2.5 rounded-xl bg-primary text-xl font-bold text-primary-foreground",
          "transition-[transform,opacity] duration-150 ease-out active:scale-[0.98] disabled:opacity-70",
          "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        )}
      >
        {m.ask.go}
        <Arrow className="size-6" strokeWidth={2.6} aria-hidden="true" />
      </button>
    </form>
  )
}
