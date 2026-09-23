import { fillSeries, rangeWindow, type Point, type Range } from "./analytics"
import { supabaseAdmin } from "./supabase/admin"

export type Row = { key: string; views: number; visitors: number }
export type Summary = {
  views: number
  visitors: number
  new_visitors: number
  no_cookie: number
  series: Point[]
  pages: Row[]
  sources: Row[]
  countries: Row[]
  devices: Row[]
  browsers: Row[]
  os: Row[]
  locales: Row[]
}
export type RecentView = {
  created_at: string
  path: string
  source: string | null
  country: string | null
  device: string
  browser: string | null
  os: string | null
  visitor_id: string | null
  new_visitor: boolean
}
export type AdminReport = {
  id: string
  created_at: string
  entry: string
  travelled_on: string
  wait_minutes: number | null
  passport: "sy" | "voa" | "res"
  note: string
  contact: string | null
  status: "pending" | "published" | "rejected"
  published_at: string | null
}
export type ReportStatus = AdminReport["status"]

export type Traffic =
  | { ok: false; reason: "notConfigured" | "error"; message?: string }
  | { ok: true; range: Range; bucket: "hour" | "day"; current: Summary; previous: Summary; recent: RecentView[] }

/** Everything the traffic page needs for one range: this period, the one before it, and the latest views. */
export async function getTraffic(range: Range): Promise<Traffic> {
  const sb = supabaseAdmin()
  if (!sb) return { ok: false, reason: "notConfigured" }
  const { since, until, prevSince, bucket } = rangeWindow(range)

  const [cur, prev, recent] = await Promise.all([
    sb.rpc("analytics_summary", { since: since.toISOString(), until: until.toISOString(), bucket }),
    sb.rpc("analytics_summary", { since: prevSince.toISOString(), until: since.toISOString(), bucket }),
    sb
      .from("page_views")
      .select("created_at, path, source, country, device, browser, os, visitor_id, new_visitor")
      .order("created_at", { ascending: false })
      .limit(30),
  ])
  const error = cur.error ?? prev.error ?? recent.error
  if (error) return { ok: false, reason: "error", message: error.message }

  const current = cur.data as Summary
  return {
    ok: true,
    range,
    bucket,
    current: { ...current, series: fillSeries(current.series, since, until, bucket) },
    previous: prev.data as Summary,
    recent: (recent.data ?? []) as RecentView[],
  }
}

export type ReportQueue =
  | { ok: false; reason: "notConfigured" | "error"; message?: string }
  | { ok: true; reports: AdminReport[]; counts: Record<ReportStatus, number> }

export async function getReports(status: ReportStatus): Promise<ReportQueue> {
  const sb = supabaseAdmin()
  if (!sb) return { ok: false, reason: "notConfigured" }
  const count = (s: ReportStatus) => sb.from("reports").select("id", { count: "exact", head: true }).eq("status", s)
  const [list, pending, published, rejected] = await Promise.all([
    sb
      .from("reports")
      .select("id, created_at, entry, travelled_on, wait_minutes, passport, note, contact, status, published_at")
      .eq("status", status)
      .order("created_at", { ascending: false })
      .limit(100),
    count("pending"),
    count("published"),
    count("rejected"),
  ])
  const error = list.error ?? pending.error ?? published.error ?? rejected.error
  if (error) return { ok: false, reason: "error", message: error.message }
  return {
    ok: true,
    reports: (list.data ?? []) as AdminReport[],
    counts: { pending: pending.count ?? 0, published: published.count ?? 0, rejected: rejected.count ?? 0 },
  }
}

/** The number on the header badge. Zero when Supabase is not set up. */
export async function pendingCount(): Promise<number> {
  const sb = supabaseAdmin()
  if (!sb) return 0
  const { count } = await sb.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending")
  return count ?? 0
}
