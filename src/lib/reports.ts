import { DATA } from "./data"
import { supabase } from "./supabase/server"
import type { Report } from "./types"

/** Published community reports, newest travel date first. Seeded editor-verified rows are always included
 *  so the feed is never empty on a fresh deployment. */
export async function getPublishedReports(): Promise<Report[]> {
  const seed = DATA.seedReports.filter((r) => r.status === "published")
  const sb = supabase()
  if (!sb) return seed

  const { data, error } = await sb
    .from("published_reports")
    .select("id, entry, travelled_on, wait_minutes, passport, note")
    .order("travelled_on", { ascending: false })
    .limit(50)

  if (error || !data) return seed
  const live: Report[] = data.map((r) => ({ ...r, status: "published" as const }))
  return [...live, ...seed].sort((a, b) => (a.travelled_on < b.travelled_on ? 1 : -1))
}
