import { AE, AT, BE, CH, DE, DK, EG, FR, GB, IQ, JO, KW, LB, NL, NO, QA, RU, SA, SE, SY, TR } from "country-flag-icons/react/3x2"
import { cn } from "@/lib/utils"

// Inline SVG flags from country-flag-icons (MIT): the same on every phone,
// unlike emoji, and no image request. Imported one by one so only these ship.
// Adding an origin means adding its flag here; the type check says so.
const FLAGS = { AE, AT, BE, CH, DE, DK, EG, FR, GB, IQ, JO, KW, LB, NL, NO, QA, RU, SA, SE, SY, TR } as const
export type FlagCode = keyof typeof FLAGS

/** A country's flag at text height. Decorative: the name or code beside it carries the meaning. */
export function Flag({ code, className }: { code: string; className?: string }) {
  const F = FLAGS[code as FlagCode]
  if (!F) return null
  return (
    <F
      aria-hidden="true"
      // A hairline keeps flags with white edges (Lebanon's field, Japan) from
      // bleeding into a white card.
      className={cn("inline-block h-[0.85em] w-auto shrink-0 rounded-[2px] border border-border", className)}
    />
  )
}
