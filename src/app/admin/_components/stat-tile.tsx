import { Minus, TrendingDown, TrendingUp } from "lucide-react"
import { change } from "@/lib/analytics"
import { cn } from "@/lib/utils"

const nf = new Intl.NumberFormat("en-GB")
const compact = new Intl.NumberFormat("en-GB", { notation: "compact", maximumFractionDigits: 1 })
const pct = new Intl.NumberFormat("en-GB", { style: "percent", maximumFractionDigits: 0, signDisplay: "exceptZero" })

/** Label, value, and the change against the previous period of the same length. Up is good for every tile here. */
export function StatTile({
  label,
  value,
  previous,
  period,
  format = "count",
  hint,
}: {
  label: string
  value: number
  previous: number
  period: string
  format?: "count" | "ratio"
  hint?: string
}) {
  const d = change(value, previous)
  const shown = format === "ratio" ? value.toFixed(1) : value >= 100_000 ? compact.format(value) : nf.format(value)
  const Icon = d === null || Math.abs(d) < 0.005 ? Minus : d > 0 ? TrendingUp : TrendingDown

  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      {/* Proportional figures at display size; the body default is tabular. */}
      <p className="text-[28px] leading-tight font-semibold tracking-tight [font-feature-settings:normal]">{shown}</p>
      <p
        className={cn(
          "inline-flex items-center gap-1 text-xs",
          d === null || Math.abs(d) < 0.005 ? "text-muted-foreground" : d > 0 ? "text-status-open" : "text-status-closed",
        )}
      >
        <Icon className="size-3.5" aria-hidden="true" />
        {d === null ? `Nothing in the previous ${period}` : `${pct.format(d)} vs previous ${period}`}
      </p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
