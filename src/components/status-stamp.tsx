import { Check, X, TriangleAlert, CircleHelp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Status } from "@/lib/types"

// Colour, word and icon together: a red word alone is invisible to a colour-blind
// reader and a lone icon means nothing to an older one. Filled, not outlined, so
// the status is the loudest thing on the card after the name.
const TONE: Record<Status, { cls: string; Icon: typeof Check }> = {
  open: { cls: "bg-status-open/15 text-status-open", Icon: Check },
  caution: { cls: "bg-status-caution/15 text-status-caution", Icon: TriangleAlert },
  closed: { cls: "bg-status-closed/15 text-status-closed", Icon: X },
  unknown: { cls: "bg-status-unknown/15 text-status-unknown", Icon: CircleHelp },
}

export function StatusStamp({
  status,
  label,
  size = "default",
  className,
}: {
  status: Status
  label: string
  size?: "default" | "sm"
  className?: string
}) {
  const { cls, Icon } = TONE[status]
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-lg font-bold whitespace-nowrap",
        size === "sm" ? "h-8 px-2.5 text-[15px]" : "h-9 px-3 text-base",
        cls,
        className,
      )}
    >
      <Icon className={size === "sm" ? "size-4" : "size-5"} strokeWidth={2.8} aria-hidden="true" />
      {label}
    </span>
  )
}

export function StatusDot({ status, className }: { status: Status; className?: string }) {
  const c = { open: "bg-status-open", caution: "bg-status-caution", closed: "bg-status-closed", unknown: "bg-status-unknown" }[status]
  return <span aria-hidden="true" className={cn("inline-block size-2 shrink-0 rounded-full", c, className)} />
}
