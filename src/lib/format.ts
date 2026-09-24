import type { Locale } from "./types"

// Arabic month names, Western (0-9) digits. Plain "ar-SY" renders Eastern Arabic
// numerals, which the site avoids everywhere; `nu-latn` keeps the locale's words
// and only swaps the digits.
const INTL_LOCALE: Record<Locale, string> = { ar: "ar-SY-u-nu-latn", en: "en-GB" }

export function formatDate(iso: string, locale: Locale) {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(INTL_LOCALE[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}

// Arabic counts a thing differently at 1, 2, 3–10 and 11+. Numbers stay Western
// digits; only the noun changes.
const AR_HOURS = (n: number) => (n === 1 ? "ساعة" : n === 2 ? "ساعتان" : n <= 10 ? `${n} ساعات` : `${n} ساعة`)
const AR_MINUTES = (n: number) => (n === 1 ? "دقيقة" : n === 2 ? "دقيقتان" : n <= 10 ? `${n} دقائق` : `${n} دقيقة`)
const EN_HOURS = (n: number) => `${n} ${n === 1 ? "hour" : "hours"}`
const EN_MINUTES = (n: number) => `${n} ${n === 1 ? "minute" : "minutes"}`

/** "ساعتان و40 دقيقة" / "2 hours 40 minutes": a duration in words, not "~2.7 h".
 *  Minutes are rounded to the nearest five and dropped past twelve hours, where
 *  they are noise on an estimate anyway. */
export function formatHours(h: number | null, locale: Locale) {
  if (h == null) return "—"
  let hours = Math.floor(h)
  let minutes = Math.round(((h - hours) * 60) / 5) * 5
  if (minutes === 60) {
    hours += 1
    minutes = 0
  }
  if (hours >= 12) minutes = 0
  const parts: string[] = []
  if (locale === "ar") {
    if (hours) parts.push(AR_HOURS(hours))
    if (minutes) parts.push(AR_MINUTES(minutes))
    return parts.length ? parts.join(" و") : "أقل من 5 دقائق"
  }
  if (hours) parts.push(EN_HOURS(hours))
  if (minutes) parts.push(EN_MINUTES(minutes))
  return parts.length ? parts.join(" ") : "under 5 minutes"
}

export function formatMinutes(min: number | null, locale: Locale) {
  if (min == null) return null
  if (min < 60) return locale === "ar" ? AR_MINUTES(min) : EN_MINUTES(min)
  return formatHours(min / 60, locale)
}

/**
 * The arrow between two places, pointing the way the sentence reads: "→" is
 * not mirrored by the bidi algorithm, so on the Arabic site it would point
 * back at the word before it.
 */
export const arrow = (locale: Locale) => (locale === "ar" ? "←" : "→")
