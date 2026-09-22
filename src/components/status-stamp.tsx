import { cn } from "@/lib/utils"
import type { Status } from "@/lib/types"

const TONE: Record<Status, string> = {
  open: "border-status-open text-status-open",
  caution: "border-status-caution text-status-caution",
  closed: "border-status-closed text-status-closed",
  unknown: "border-status-unknown text-status-unknown",
}

/** The passport-stamp status chip: outlined, never filled. */
export function StatusStamp({ status, label, className }: { status: Status; label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md border-[1.5px] px-2 py-0.5 text-[11px] font-bold tracking-wide",
        TONE[status],
        className,
      )}
    >
      {label}
    </span>
  )
}

export function StatusDot({ status, className }: { status: Status; className?: string }) {
  const c = { open: "bg-status-open", caution: "bg-status-caution", closed: "bg-status-closed", unknown: "bg-status-unknown" }[status]
  return <span aria-hidden="true" className={cn("inline-block size-2 shrink-0 rounded-full", c, className)} />
}
