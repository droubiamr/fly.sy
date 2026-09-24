import { Flag } from "@/components/flag"

/** A country's flag with its two-letter code. The code stays because several flags look alike at this size. */
export function CountryTag({ code }: { code: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 font-mono text-[13px] font-semibold tracking-wider text-muted-foreground">
      <Flag code={code} className="h-3.5" />
      {code}
    </span>
  )
}
