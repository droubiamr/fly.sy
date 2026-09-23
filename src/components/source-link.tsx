import type { Source } from "@/lib/types"

/**
 * A source's name, linked to where it publishes when it has a home. Every
 * source opens in a new tab, site paths included, so the fact being checked
 * stays on screen.
 */
export function SourceLink({ source, children, className }: { source: Source; children: React.ReactNode; className?: string }) {
  const { url } = source
  if (!url) return <span className={className}>{children}</span>
  const cls = ["underline decoration-muted-foreground/40 underline-offset-[3px] hover:decoration-current", className].filter(Boolean).join(" ")
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={cls}>
      {children}
    </a>
  )
}
