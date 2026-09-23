import { CircleHelp, MessageSquareText, ShieldCheck } from "lucide-react"
import { DATA } from "@/lib/data"
import { formatDate } from "@/lib/format"
import type { Confidence, Locale } from "@/lib/types"
import type { Messages } from "@/messages"
import { SourceLink } from "@/components/source-link"
import { cn } from "@/lib/utils"

// The confidence level as an icon with its word: a shield for a source we
// trust, a speech bubble for a report, a question mark for a guess. The word
// stays because none of the three icons is universal on its own.
const CONFIDENCE: Record<Confidence, { Icon: typeof ShieldCheck; tone: string }> = {
  verified: { Icon: ShieldCheck, tone: "text-status-open" },
  reported: { Icon: MessageSquareText, tone: "" },
  unconfirmed: { Icon: CircleHelp, tone: "" },
}

/** "✓ verified · GACA · checked 20 Sep 2026" — appears under every fact. The source is a link where it has a home. */
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
  const c = confidence && CONFIDENCE[confidence]
  return (
    <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
      {c && (
        <span className={cn("inline-flex items-center gap-1", c.tone)}>
          <c.Icon className="size-3.5" aria-hidden="true" />
          {m.confidence[confidence]}
        </span>
      )}
      {c && <span aria-hidden="true">·</span>}
      <span>{src ? <SourceLink source={src} locale={locale}>{src.name[locale]}</SourceLink> : source}</span>
      {seen && (
        <>
          <span aria-hidden="true">·</span>
          <span>
            {m.checked} <time dateTime={seen}>{formatDate(seen, locale)}</time>
          </span>
        </>
      )}
    </p>
  )
}
