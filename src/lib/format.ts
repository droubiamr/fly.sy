import type { Locale } from "./types"

// Arabic month names, Western (0-9) digits. Plain "ar-SY" renders Eastern Arabic
// numerals, which the site avoids everywhere; `nu-latn` keeps the locale's words
// and only swaps the digits.
export const INTL_LOCALE: Record<Locale, string> = { ar: "ar-SY-u-nu-latn", en: "en-GB" }

/** The calendar day of a date or a UTC timestamp: "20 Sept 2026". */
export function formatDate(iso: string, locale: Locale) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(INTL_LOCALE[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}

export const DATE_TIME: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
}

/** A moment to the minute: "2 Oct 2026, 08:58". Without a `timeZone` it is on the reader's own clock. */
export function formatDateTime(iso: string, locale: Locale, timeZone?: string) {
  return new Date(iso).toLocaleString(INTL_LOCALE[locale], { ...DATE_TIME, timeZone })
}

/**
 * How long ago a moment was, in the largest whole unit: "2 hours ago", "yesterday",
 * "قبل ساعتين". Takes the Intl locale and refers to nothing outside itself, so
 * `LocalTime` can also inline its source into the page as a script.
 */
export function timeAgo(iso: string, intlLocale: string, now: number) {
  const rtf = new Intl.RelativeTimeFormat(intlLocale, { numeric: "auto" })
  const s = Math.max(0, Math.floor((now - Date.parse(iso)) / 1000))
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ]
  for (const [unit, size] of units) if (s >= size) return rtf.format(-Math.floor(s / size), unit)
  return rtf.format(0, "second")
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

/** A site's host as a reader sees it in the address bar: "damairport.gov.sy", no scheme, no www. */
export const hostOf = (url: string) => new URL(url).host.replace(/^www\./, "")

/** An account's address the same way, with its path: "t.me/SyrGACA", "youtube.com/@SyGACA". */
export const shortUrl = (url: string) => {
  const u = new URL(url)
  return `${hostOf(url)}${u.pathname}`.replace(/\/$/, "")
}

/**
 * The arrow between two places, pointing the way the sentence reads: "→" is
 * not mirrored by the bidi algorithm, so on the Arabic site it would point
 * back at the word before it.
 */
export const arrow = (locale: Locale) => (locale === "ar" ? "←" : "→")
