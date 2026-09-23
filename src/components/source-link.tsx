import { ExternalLink } from "lucide-react"
import type { Source } from "@/lib/types"

/**
 * A source's name, linked to where it publishes when it has a home. Every
 * source opens in a new tab, site paths included, so the fact being checked
 * stays on screen. A small arrow after the name says so before the tap.
 */
export function SourceLink({ source, children, className }: { source: Source; children: React.ReactNode; className?: string }) {
  const { url } = source
  if (!url) return <span className={className}>{children}</span>
  const cls = [
    "inline-flex items-center gap-[0.3em] underline decoration-muted-foreground/40 underline-offset-[3px] hover:decoration-current",
    className,
  ]
    .filter(Boolean)
    .join(" ")
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={cls}>
      {children}
      {/* Sized to the text so it fits the 12px provenance line and the 14px About list alike; flipped for RTL so the arrow still points away. */}
      <ExternalLink className="size-[0.8em] shrink-0 opacity-60 rtl:-scale-x-100" aria-hidden="true" />
    </a>
  )
}
