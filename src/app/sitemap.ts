import type { MetadataRoute } from "next"
import { DATA } from "@/lib/data"
import { SITE_URL } from "@/lib/site"

// The planner keeps its answer in the URL, but every combination is the same
// page, so only the six routes are listed. lastModified is the data review date:
// that is when the content actually changes.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(DATA.meta.updated)
  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/airlines`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/crossings`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/reports`, lastModified, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/reports/new`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/about`, lastModified, changeFrequency: "monthly", priority: 0.5 },
  ]
}
