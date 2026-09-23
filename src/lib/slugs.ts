import type { Passport } from "./types"

/** URL words for the passport choice. Latin in both languages: short, stable, readable in a share sheet. */
export const PASSPORT_SLUGS: Record<Passport, string> = {
  sy: "syrian-passport",
  voa: "visa-on-arrival",
  res: "pre-approval",
}

const PASSPORT_BY_SLUG = Object.fromEntries(Object.entries(PASSPORT_SLUGS).map(([k, v]) => [v, k])) as Record<string, Passport>
export const passportFromSlug = (s: string): Passport | undefined =>
  Object.hasOwn(PASSPORT_BY_SLUG, s) ? PASSPORT_BY_SLUG[s] : undefined

/** "Jdeidet Yabous" → "jdeidet-yabous", "Al-Qa'im" → "al-qaim", "Türkiye" → "turkiye". */
export const slugify = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
