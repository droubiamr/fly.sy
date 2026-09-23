import { cn } from "@/lib/utils"
import type { Status } from "@/lib/types"

const TONE: Record<Status, { pill: string; dot: string }> = {
  open: { pill: "bg-status-open/12 text-status-open", dot: "bg-status-open" },
  caution: { pill: "bg-status-caution/14 text-status-caution", dot: "bg-status-caution" },
  closed: { pill: "bg-status-closed/12 text-status-closed", dot: "bg-status-closed" },
  unknown: { pill: "bg-muted text-muted-foreground", dot: "bg-status-unknown" },
}

/**
 * Status as a Linkat badge: a small pill, tinted in the status colour, with
 * a dot so the state reads without the colour too. `solid` is for the green
 * panel, where a tint would disappear: a light pill with the coloured dot.
 */
export function StatusBadge({ status, label, solid, className }: { status: Status; label: string; solid?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit shrink-0 items-center gap-1.5 rounded-4xl px-2.5 text-xs font-medium whitespace-nowrap",
        solid ? "bg-primary text-primary-foreground" : TONE[status].pill,
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", TONE[status].dot)} />
      {label}
    </span>
  )
}

export function StatusDot({ status, className }: { status: Status; className?: string }) {
  return <span aria-hidden="true" className={cn("inline-block size-2 shrink-0 rounded-full", TONE[status].dot, className)} />
}
