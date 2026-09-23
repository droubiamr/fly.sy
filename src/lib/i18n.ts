import { notFound } from "next/navigation"
import type { Locale } from "./types"
import { getMessages } from "@/messages"
import { DEFAULT_LOCALE, isLocale } from "./site"
import { tx } from "./text"

export { fmt, tx } from "./text"

/** Strings and helpers for a locale. The locale comes from the URL (see site.ts), never from a cookie. */
export function getI18n(lang: string) {
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE
  return { locale, m: getMessages(locale), t: (x: Parameters<typeof tx>[0]) => tx(x, locale) }
}

/**
 * Pages call this first. The proxy only sends ar or en, but a path that skipped
 * it (a file-like URL such as /x.txt matches [lang]) must be a 404, not a copy
 * of the Arabic page under a second address.
 */
export function requireLocale(lang: string): Locale {
  if (!isLocale(lang)) notFound()
  return lang
}
