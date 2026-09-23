import type { MetadataRoute } from "next"
import { DATA, DESTINATIONS, ORIGINS, airlinePath, entryPath, routePath } from "@/lib/data"
import { absoluteUrl } from "@/lib/site"

/** Every indexable path, language-neutral. The sitemap lists each once per language with hreflang alternates. */
export function sitePaths(): { path: string; priority: number }[] {
  const out: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/airlines", priority: 0.9 },
    { path: "/crossings", priority: 0.9 },
    { path: "/documents", priority: 0.9 },
    { path: "/reports", priority: 0.7 },
    { path: "/about", priority: 0.5 },
  ]
  for (const id of Object.keys(DATA.entries)) out.push({ path: entryPath(id), priority: 0.8 })
  for (const code of Object.keys(DATA.airlines)) out.push({ path: airlinePath(code), priority: 0.6 })
  for (const o of ORIGINS) for (const d of DESTINATIONS) out.push({ path: routePath(o.id, d.id), priority: 0.7 })
  return out
}

export default function sitemap(): MetadataRoute.Sitemap {
  // The data review date: that is when the content actually changes.
  const lastModified = new Date(`${DATA.meta.updated}T00:00:00Z`)
  return sitePaths().flatMap(({ path, priority }) => {
    const languages = { ar: absoluteUrl("ar", path), en: absoluteUrl("en", path), "x-default": absoluteUrl("ar", path) }
    return (["ar", "en"] as const).map((locale) => ({
      url: absoluteUrl(locale, path),
      lastModified,
      changeFrequency: path === "/reports" ? ("daily" as const) : ("weekly" as const),
      priority,
      alternates: { languages },
    }))
  })
}
