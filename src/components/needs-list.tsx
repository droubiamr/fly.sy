import type { Locale, Need } from "@/lib/types"
import type { Messages } from "@/messages"
import { Provenance } from "@/components/provenance"

/** The documents and warnings for one mode × passport, each with its source. */
export function NeedsList({ needs, locale, m, className }: { needs: Need[]; locale: Locale; m: Messages; className?: string }) {
  return (
    <ul className={["flex list-disc flex-col gap-2.5 ps-4 text-[13.5px] leading-relaxed", className].filter(Boolean).join(" ")}>
      {needs.map((n, i) => (
        <li key={i}>
          {n.text[locale]}
          <Provenance source={n.source} locale={locale} m={m} />
        </li>
      ))}
    </ul>
  )
}
