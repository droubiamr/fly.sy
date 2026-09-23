import type { Locale } from "./types"

/** The one canonical origin. No www, no trailing slash. Every absolute URL on the site is built from this. */
export const SITE_URL = "https://fly.sy"
export const SITE_NAME = "fly.sy"

export const LOCALES = ["ar", "en"] as const satisfies readonly Locale[]
export const DEFAULT_LOCALE: Locale = "ar"

export const isLocale = (v: unknown): v is Locale => v === "ar" || v === "en"
export const otherLocale = (l: Locale): Locale => (l === "ar" ? "en" : "ar")

/** BCP 47 tags for hreflang, Open Graph and structured data. */
export const LANG_TAG: Record<Locale, string> = { ar: "ar", en: "en" }
export const OG_LOCALE: Record<Locale, string> = { ar: "ar_SY", en: "en_GB" }

/**
 * Arabic is the site's home language and lives at the root; English lives under /en.
 * Google wants one URL per language version, so the locale is never a cookie.
 */
export function localePath(locale: Locale, path = "/"): string {
  const clean = path === "" ? "/" : path
  if (locale === "ar") return clean
  return clean === "/" ? "/en" : `/en${clean}`
}

/** Absolute URL for a page. The root is the bare origin, which is also how Next writes the canonical. */
export function absoluteUrl(locale: Locale, path = "/"): string {
  const p = localePath(locale, path)
  return p === "/" ? SITE_URL : SITE_URL + p
}

/** Strip the /en prefix off a pathname and say which locale it was. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  if (pathname === "/en") return { locale: "en", path: "/" }
  if (pathname.startsWith("/en/")) return { locale: "en", path: pathname.slice(3) }
  return { locale: "ar", path: pathname }
}
