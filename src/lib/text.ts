import type { Locale, Text } from "./types"

/** The text of a bilingual field in one language, falling back to Arabic. */
export const tx = (x: Text | undefined, locale: Locale) => (x ? x[locale] ?? x.ar : "")

/** "{n} ways from {origin}" → filled in. Keys that are missing stay as they are, so a typo is visible. */
export function fmt(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (all, k: string) => (k in vars ? String(vars[k]) : all))
}
