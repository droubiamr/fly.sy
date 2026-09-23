import { DATA } from "./data"
import { db } from "./db"
import type { Report } from "./types"

/** Published community reports, newest travel date first. Seeded editor-verified rows are always included
 *  so the feed is never empty on a fresh deployment. The contact column is never selected here. */
export async function getPublishedReports(): Promise<Report[]> {
  const seed = DATA.seedReports.filter((r) => r.status === "published")
  const d = db()
  if (!d) return seed

  try {
    const { results } = await d
      .prepare(
        "select id, entry, travelled_on, wait_minutes, passport, note from reports where status = 'published' order by travelled_on desc limit 50",
      )
      .all<Omit<Report, "status">>()
    const live: Report[] = results.map((r) => ({ ...r, status: "published" as const }))
    return [...live, ...seed].sort((a, b) => (a.travelled_on < b.travelled_on ? 1 : -1))
  } catch {
    return seed
  }
}
