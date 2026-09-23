import Link from "next/link"
import type { Source } from "@/lib/types"

/**
 * A source's name, linked to where it publishes when it has a home. Site paths
 * stay in-app; anything else opens in a new tab, since it leaves the site.
 */
export function SourceLink({ source, children, className }: { source: Source; children: React.ReactNode; className?: string }) {
  const { url } = source
  if (!url) return <span className={className}>{children}</span>
  const cls = ["underline decoration-muted-foreground/40 underline-offset-[3px] hover:decoration-current", className].filter(Boolean).join(" ")
  if (url.startsWith("/")) {
    return (
      <Link href={url} className={cls}>
        {children}
      </Link>
    )
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={cls}>
      {children}
    </a>
  )
}
