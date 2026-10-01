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

export function formatHours(h: number | null, locale: Locale) {
  if (h == null) return "—"
  const n = h.toLocaleString(INTL_LOCALE[locale], { maximumFractionDigits: 1 })
  return `~${n} ${locale === "ar" ? "س" : "h"}`
}

/** Hours and minutes, to the nearest five minutes: "2 h 40 min", "2 س 40 د". For signs and lists, where "~2.7 h" makes people do arithmetic. */
export function formatDuration(h: number | null, locale: Locale) {
  if (h == null) return "—"
  const total = Math.round((h * 60) / 5) * 5
  const hh = Math.floor(total / 60)
  const mm = total % 60
  const [H, M] = locale === "ar" ? ["س", "د"] : ["h", "min"]
  if (!hh) return `${mm} ${M}`
  return mm ? `${hh} ${H} ${mm} ${M}` : `${hh} ${H}`
}

/** Hours as words for running text: "2.7 hours", "2.7 ساعة". The "~" of formatHours reads badly inside a sentence. */
export function formatHoursText(h: number, locale: Locale) {
  const n = h.toLocaleString(INTL_LOCALE[locale], { maximumFractionDigits: 1 })
  if (locale === "ar") return `${n} ساعة`
  return `${n} ${h === 1 ? "hour" : "hours"}`
}

export function formatMinutes(min: number | null, locale: Locale) {
  if (min == null) return null
  if (min < 60) return locale === "ar" ? `${min.toLocaleString(INTL_LOCALE.ar)} دقيقة` : `${min} min`
  return formatHours(Math.round((min / 60) * 10) / 10, locale)
}

/**
 * The arrow between two places, pointing the way the sentence reads: "→" is
 * not mirrored by the bidi algorithm, so on the Arabic site it would point
 * back at the word before it.
 */
export const arrow = (locale: Locale) => (locale === "ar" ? "←" : "→")
