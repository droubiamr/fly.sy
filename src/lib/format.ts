import type { Locale } from "./types"

export function formatDate(iso: string, locale: Locale) {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(locale === "ar" ? "ar-SY" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}

export function formatHours(h: number | null, locale: Locale) {
  if (h == null) return "—"
  const n = h.toLocaleString(locale === "ar" ? "ar-SY" : "en-GB", { maximumFractionDigits: 1 })
  return `~${n} ${locale === "ar" ? "س" : "h"}`
}

export function formatMinutes(min: number | null, locale: Locale) {
  if (min == null) return null
  if (min < 60) return locale === "ar" ? `${min.toLocaleString("ar-SY")} دقيقة` : `${min} min`
  return formatHours(Math.round((min / 60) * 10) / 10, locale)
}
