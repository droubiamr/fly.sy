/** Two-letter country code in a small chip. Codes, not flags: renders identically everywhere and never needs an image. */
export function CountryTag({ code }: { code: string }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-[5px] bg-muted px-1.5 py-px font-mono text-[10px] font-semibold tracking-wider text-muted-foreground">
      {code}
    </span>
  )
}
