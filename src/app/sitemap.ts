import type { MetadataRoute } from "next"
import { DATA } from "@/lib/data"
import { entryHref } from "@/lib/entries"
import { NAV, ABOUT } from "@/lib/nav"
import { SITE_URL } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(DATA.meta.updated)
  const sections = [...NAV, ABOUT].map(({ href }) => ({ url: `${SITE_URL}${href}`, lastModified }))
  const entries = Object.entries(DATA.entries).map(([id, e]) => ({ url: `${SITE_URL}${entryHref(id, e)}`, lastModified }))
  return [...sections, ...entries]
}
