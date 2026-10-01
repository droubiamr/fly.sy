import { DATA, ORIGINS, airEntries, airlinePath, entryPath, landEntries, routePath } from "./data"
import { getMessages } from "@/messages"
import { localePath } from "./site"
import type { Locale } from "./types"

export type SearchGroup = "countries" | "airports" | "crossings" | "airlines" | "pages"
export type SearchItem = { group: SearchGroup; label: string; sub?: string; href: string; keywords: string }

/**
 * Everything the site search can jump to, in one language. The other
 * language's name rides along as a keyword, so "Germany" finds ألمانيا on the
 * Arabic site and the other way round. Served as a static file and fetched
 * only when the search is opened, so no page carries it.
 */
export function searchIndex(locale: Locale): SearchItem[] {
  const m = getMessages(locale)
  const other = locale === "ar" ? "en" : "ar"
  const at = (path: string) => localePath(locale, path)
  const items: SearchItem[] = [
    ...ORIGINS.map((o) => ({ group: "countries" as const, label: o.name[locale], sub: m.nav.toDamascus, href: at(routePath(o.id, "damascus")), keywords: `${o.name[other]} ${o.id}` })),
    ...airEntries().map(([id, e]) => ({ group: "airports" as const, label: e.name[locale], sub: m.status[e.status], href: at(entryPath(id)), keywords: `${e.name[other]} ${id}` })),
    ...landEntries().map(([id, e]) => ({ group: "crossings" as const, label: e.name[locale], sub: m.status[e.status], href: at(entryPath(id)), keywords: e.name[other] })),
    ...Object.entries(DATA.airlines).map(([code, a]) => ({ group: "airlines" as const, label: a.name[locale], href: at(airlinePath(code)), keywords: `${a.name[other]} ${code}` })),
    { group: "pages", label: m.documents.title, href: at("/documents"), keywords: getMessages(other).documents.title },
    { group: "pages", label: m.news.title, href: at("/news"), keywords: getMessages(other).news.title },
    { group: "pages", label: m.reports.title, href: at("/reports"), keywords: getMessages(other).reports.title },
    { group: "pages", label: m.about.title, href: at("/about"), keywords: getMessages(other).about.title },
  ]
  return items
}
