import type { Locale } from "./types"

/** Name of the first-party cookie that recognises a returning browser. A random UUID, nothing else. */
export const VISITOR_COOKIE = "fsy_vid"
/** Chrome caps cookie lifetime at 400 days; asking for more is silently cut to that. */
export const VISITOR_COOKIE_MAX_AGE = 400 * 24 * 60 * 60

export type Device = "mobile" | "tablet" | "desktop" | "other"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export const isVisitorId = (v: unknown): v is string => typeof v === "string" && UUID.test(v)

/** The page a view was on: an absolute path with no query, hash or trailing slash. Null for anything else. */
export function normalizePath(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) return null
  let path = raw.split(/[?#]/, 1)[0]
  if (path.length > 1) path = path.replace(/\/+$/, "")
  if (path === "" || path.length > 300 || /[\s\u0000-\u001f]/.test(path)) return null
  return path
}

/** Which language the page was in: English lives under /en, Arabic everywhere else. */
export const localeOfPath = (path: string): Locale => (path === "/en" || path.startsWith("/en/") ? "en" : "ar")

/**
 * Where a visit came from: an explicit utm_source wins, otherwise the referring host without "www.".
 * Links from the site itself are not a source, so they come back null.
 */
export function sourceFrom(referrer: unknown, utm: unknown, ownHosts: readonly string[]): string | null {
  if (typeof utm === "string") {
    const tag = utm.trim().toLowerCase()
    if (/^[a-z0-9][a-z0-9._-]{0,59}$/.test(tag)) return tag
  }
  if (typeof referrer !== "string" || referrer === "") return null
  let host: string
  try {
    const url = new URL(referrer)
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    host = url.hostname.toLowerCase().replace(/^www\./, "")
  } catch {
    return null
  }
  if (!host || host.length > 200) return null
  const own = ownHosts.map((h) => h.toLowerCase().replace(/^www\./, ""))
  return own.includes(host) ? null : host
}

/** Cloudflare's two-letter country, minus its placeholders for "unknown" (XX) and Tor (T1). */
export function countryFrom(header: string | null | undefined): string | null {
  const c = (header ?? "").trim().toUpperCase()
  return /^[A-Z]{2}$/.test(c) && c !== "XX" && c !== "T1" ? c : null
}

/** Next's userAgent() leaves device.type undefined for desktop browsers. */
export function deviceFrom(type: string | undefined): Device {
  if (!type) return "desktop"
  if (type === "mobile" || type === "tablet") return type
  return "other"
}

/** A short product name, trimmed to what the column holds. */
export const shortName = (name: string | undefined): string | null => (name ? name.slice(0, 40) : null)

// ——— Dashboard periods ———

export const RANGES = ["24h", "7d", "30d", "90d"] as const
export type Range = (typeof RANGES)[number]
export type Bucket = "hour" | "day"

export const isRange = (v: unknown): v is Range => RANGES.includes(v as Range)

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

/**
 * The window a range covers, ending now, and the window of the same length just before it (for the
 * "vs previous period" deltas). Day ranges start at a UTC midnight so each bucket is a whole day.
 */
export function rangeWindow(range: Range, now = new Date()) {
  if (range === "24h") {
    const until = new Date(Math.floor(now.getTime() / HOUR) * HOUR + HOUR)
    const since = new Date(until.getTime() - 24 * HOUR)
    return { since, until, prevSince: new Date(since.getTime() - 24 * HOUR), bucket: "hour" as Bucket }
  }
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90
  const until = new Date(Math.floor(now.getTime() / DAY) * DAY + DAY)
  const since = new Date(until.getTime() - days * DAY)
  return { since, until, prevSince: new Date(since.getTime() - days * DAY), bucket: "day" as Bucket }
}

export type Point = { t: string; views: number; visitors: number }

/** One point per bucket across the window, zeros where the database had no rows. */
export function fillSeries(rows: readonly Point[], since: Date, until: Date, bucket: Bucket): Point[] {
  const step = bucket === "hour" ? HOUR : DAY
  const byTime = new Map(rows.map((r) => [new Date(r.t).getTime(), r]))
  const out: Point[] = []
  for (let t = since.getTime(); t < until.getTime(); t += step) {
    const r = byTime.get(t)
    out.push({ t: new Date(t).toISOString(), views: r?.views ?? 0, visitors: r?.visitors ?? 0 })
  }
  return out
}

/** A round axis maximum at or above the data, and the tick step that divides it into at most four. */
export function niceScale(max: number): { top: number; step: number } {
  if (max <= 0) return { top: 4, step: 1 }
  const raw = max / 4
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((f) => f * mag).find((s) => s >= raw && Number.isInteger(s)) ?? Math.ceil(raw)
  return { top: Math.ceil(max / step) * step, step }
}

/** Signed change against the previous period, or null when there was nothing to compare with. */
export function change(current: number, previous: number): number | null {
  if (previous === 0) return null
  return (current - previous) / previous
}
