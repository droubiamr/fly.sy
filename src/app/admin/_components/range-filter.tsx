import Link from "next/link"
import { RANGES, type Range } from "@/lib/analytics"
import { cn } from "@/lib/utils"

export const RANGE_LABEL: Record<Range, string> = { "24h": "24 hours", "7d": "7 days", "30d": "30 days", "90d": "90 days" }

/** Date range presets: one row, above everything it scopes. */
export function RangeFilter({ current }: { current: Range }) {
  return (
    <nav aria-label="Period" className="inline-flex rounded-full border bg-card p-1">
      {RANGES.map((r) => (
        <Link
          key={r}
          href={r === "7d" ? "/admin" : `/admin?range=${r}`}
          aria-current={r === current ? "true" : undefined}
          className={cn(
            "inline-flex h-9 min-w-11 items-center justify-center rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
            r === current && "bg-primary text-primary-foreground hover:text-primary-foreground",
          )}
        >
          {r}
          <span className="sr-only"> ({RANGE_LABEL[r]})</span>
        </Link>
      ))}
    </nav>
  )
}
