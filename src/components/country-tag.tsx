import { Flag } from "@/components/flag"

/** A country's flag with its two-letter code. The code stays because several flags look alike at 12px. */
export function CountryTag({ code }: { code: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-[5px] bg-muted px-1.5 py-px font-mono text-[10px] font-semibold tracking-wider text-muted-foreground">
      <Flag code={code} className="h-[10px]" />
      {code}
    </span>
  )
}
