import { DATA } from "@/lib/data"
import { formatDate } from "@/lib/format"
import type { Confidence, Locale } from "@/lib/types"
import type { Messages } from "@/messages"

/** "verified · Source: X · checked 20 Sep 2026" — appears under every fact. */
export function Provenance({
  confidence,
  source,
  seen,
  locale,
  m,
}: {
  confidence?: Confidence
  source: string
  seen?: string
  locale: Locale
  m: Messages
}) {
  const src = DATA.sources[source]
  return (
    <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
      {confidence && <span>{m.confidence[confidence]}</span>}
      {confidence && <span aria-hidden="true">·</span>}
      <span>
        {m.source}: {src ? src.name[locale] : source}
      </span>
      {seen && (
        <>
          <span aria-hidden="true">·</span>
          <span>
            {m.checked} {formatDate(seen, locale)}
          </span>
        </>
      )}
    </p>
  )
}
