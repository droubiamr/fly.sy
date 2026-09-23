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

export function formatMinutes(min: number | null, locale: Locale) {
  if (min == null) return null
  if (min < 60) return locale === "ar" ? `${min.toLocaleString(INTL_LOCALE.ar)} دقيقة` : `${min} min`
  return formatHours(Math.round((min / 60) * 10) / 10, locale)
}
