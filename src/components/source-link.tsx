import Link from "next/link"
import { localePath } from "@/lib/site"
import type { Locale, Source } from "@/lib/types"

/**
 * A source's name, linked to where it publishes when it has a home. An outside
 * source opens in a new tab so the fact being checked stays on screen; a site
 * path (such as /reports) stays in the tab and in the reader's language.
 */
export function SourceLink({
  source,
  locale,
  children,
  className,
}: {
  source: Source
  locale: Locale
  children: React.ReactNode
  className?: string
}) {
  const { url } = source
  if (!url) return <span className={className}>{children}</span>
  const cls = ["underline decoration-muted-foreground/40 underline-offset-[3px] hover:decoration-current", className].filter(Boolean).join(" ")
  if (url.startsWith("/")) {
    return (
      <Link href={localePath(locale, url)} className={cls}>
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
