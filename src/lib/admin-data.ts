import { fillSeries, rangeWindow, type Point, type Range } from "./analytics"
import { db, type D1Database } from "./db"

export type Row = { key: string; views: number; visitors: number }
export type Totals = { views: number; visitors: number; new_visitors: number; no_cookie: number; ips: number }
export type Summary = Totals & {
  series: Point[]
  pages: Row[]
  sources: Row[]
  countries: Row[]
  cities: Row[]
  networks: Row[]
  ipRows: Row[]
  devices: Row[]
  browsers: Row[]
  os: Row[]
  locales: Row[]
}
export type RecentView = {
  ts: number
  path: string
  source: string | null
  ip: string | null
  country: string | null
  region: string | null
  city: string | null
  as_org: string | null
  user_agent: string | null
  device: string
  browser: string | null
  os: string | null
  visitor_id: string | null
  new_visitor: number
}
export type AdminReport = {
  id: string
  created_at: number
  entry: string
  travelled_on: string
  wait_minutes: number | null
  passport: "sy" | "voa" | "res"
  note: string
  contact: string | null
  status: "pending" | "published" | "rejected"
  published_at: number | null
}
export type ReportStatus = AdminReport["status"]

/** Narrows every figure on the traffic page to one IP address or one visitor cookie. */
export type Filter = { ip?: string; visitor?: string }

export type Traffic =
  | { ok: false; reason: "notConfigured" | "error"; message?: string }
  | {
      ok: true
      range: Range
      bucket: "hour" | "day"
      current: Summary
      previous: Totals
      recent: RecentView[]
    }

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

function where(since: number, until: number, f: Filter): { sql: string; args: unknown[] } {
  let sql = "ts >= ? and ts < ?"
  const args: unknown[] = [since, until]
  if (f.ip) {
    sql += " and ip = ?"
    args.push(f.ip)
  }
  if (f.visitor) {
    sql += " and visitor_id = ?"
    args.push(f.visitor)
  }
  return { sql, args }
}

function totals(d: D1Database, since: number, until: number, f: Filter) {
  const w = where(since, until, f)
  return d
    .prepare(
      `select count(*) as views,
              count(distinct visitor_id) as visitors,
              count(distinct case when new_visitor = 1 then visitor_id end) as new_visitors,
              coalesce(sum(visitor_id is null), 0) as no_cookie,
              count(distinct ip) as ips
       from page_views where ${w.sql}`,
    )
    .bind(...w.args)
}

// Column names come from this fixed list only, never from the request.
const DIMENSIONS = {
  pages: { expr: "path", limit: 25, skipNull: false },
  sources: { expr: "source", limit: 25, skipNull: true },
  countries: { expr: "country", limit: 25, skipNull: true },
  cities: { expr: "city || ', ' || country", limit: 25, skipNull: true },
  networks: { expr: "as_org", limit: 25, skipNull: true },
  ipRows: { expr: "ip", limit: 25, skipNull: true },
  devices: { expr: "device", limit: 10, skipNull: false },
  browsers: { expr: "coalesce(browser, 'Unknown')", limit: 10, skipNull: false },
  os: { expr: "coalesce(os, 'Unknown')", limit: 10, skipNull: false },
  locales: { expr: "locale", limit: 10, skipNull: false },
} as const

/** Everything the traffic page needs, in one D1 round trip: totals now and before, the series, every top list
 *  and the latest views. */
export async function getTraffic(range: Range, filter: Filter = {}): Promise<Traffic> {
  const d = db()
  if (!d) return { ok: false, reason: "notConfigured" }
  const { since, until, prevSince, bucket } = rangeWindow(range)
  const [s, u, p] = [since.getTime(), until.getTime(), prevSince.getTime()]
  const w = where(s, u, filter)
  const step = bucket === "hour" ? HOUR : DAY
  const dims = Object.entries(DIMENSIONS)

  try {
    const results = await d.batch([
      totals(d, s, u, filter),
      totals(d, p, s, filter),
      d
        .prepare(
          `select (ts / ${step}) * ${step} as t, count(*) as views, count(distinct visitor_id) as visitors
           from page_views where ${w.sql} group by 1 order by 1`,
        )
        .bind(...w.args),
      ...dims.map(([, dim]) =>
        d
          .prepare(
            `select ${dim.expr} as key, count(*) as views, count(distinct visitor_id) as visitors
             from page_views where ${w.sql}${dim.skipNull ? ` and ${dim.expr} is not null` : ""}
             group by 1 order by 2 desc, 1 limit ${dim.limit}`,
          )
          .bind(...w.args),
      ),
      d
        .prepare(
          `select ts, path, source, ip, country, region, city, as_org, user_agent, device, browser, os, visitor_id, new_visitor
           from page_views where ${where(0, Number.MAX_SAFE_INTEGER, filter).sql} order by ts desc limit 50`,
        )
        .bind(...where(0, Number.MAX_SAFE_INTEGER, filter).args),
    ])

    const [cur, prev, series] = results as unknown as [D1ResultOf<Totals>, D1ResultOf<Totals>, D1ResultOf<{ t: number; views: number; visitors: number }>]
    const lists = Object.fromEntries(dims.map(([name], i) => [name, results[3 + i].results as Row[]])) as Record<keyof typeof DIMENSIONS, Row[]>
    const recent = results[3 + dims.length].results as RecentView[]
    const points = series.results.map((r) => ({ t: new Date(r.t).toISOString(), views: r.views, visitors: r.visitors }))

    return {
      ok: true,
      range,
      bucket,
      current: { ...cur.results[0], ...lists, series: fillSeries(points, since, until, bucket) },
      previous: prev.results[0],
      recent,
    }
  } catch (e) {
    return { ok: false, reason: "error", message: e instanceof Error ? e.message : String(e) }
  }
}

type D1ResultOf<T> = { results: T[] }

export type ReportQueue =
  | { ok: false; reason: "notConfigured" | "error"; message?: string }
  | { ok: true; reports: AdminReport[]; counts: Record<ReportStatus, number> }

export async function getReports(status: ReportStatus): Promise<ReportQueue> {
  const d = db()
  if (!d) return { ok: false, reason: "notConfigured" }
  try {
    const [list, counts] = await d.batch([
      d
        .prepare(
          "select id, created_at, entry, travelled_on, wait_minutes, passport, note, contact, status, published_at from reports where status = ? order by created_at desc limit 100",
        )
        .bind(status),
      d.prepare("select status, count(*) as n from reports group by status"),
    ])
    const c: Record<ReportStatus, number> = { pending: 0, published: 0, rejected: 0 }
    for (const r of counts.results as { status: ReportStatus; n: number }[]) c[r.status] = r.n
    return { ok: true, reports: list.results as AdminReport[], counts: c }
  } catch (e) {
    return { ok: false, reason: "error", message: e instanceof Error ? e.message : String(e) }
  }
}

/** The number on the header badge. Zero when there is no database. */
export async function pendingCount(): Promise<number> {
  const d = db()
  if (!d) return 0
  try {
    const r = await d.prepare("select count(*) as n from reports where status = 'pending'").first<{ n: number }>()
    return r?.n ?? 0
  } catch {
    return 0
  }
}

export type AdminSessionRow = {
  id_hash: string
  created_at: number
  last_seen: number
  expires_at: number
  ip: string | null
  country: string | null
  user_agent: string | null
  access_email: string | null
}
export type LoginAttempt = { ts: number; ip: string | null; country: string | null; user_agent: string | null; ok: number; reason: string | null }

/** Live admin sessions (inside both timeouts) and the latest sign-in attempts, for /admin/security. */
export async function getSecurity(idleMs: number): Promise<{ sessions: AdminSessionRow[]; attempts: LoginAttempt[] }> {
  const d = db()
  if (!d) return { sessions: [], attempts: [] }
  const now = Date.now()
  const [sessions, attempts] = await d.batch([
    d
      .prepare(
        "select id_hash, created_at, last_seen, expires_at, ip, country, user_agent, access_email from admin_sessions where expires_at > ? and last_seen > ? order by last_seen desc",
      )
      .bind(now, now - idleMs),
    d.prepare("select ts, ip, country, user_agent, ok, reason from login_attempts order by ts desc limit 50"),
  ])
  return { sessions: sessions.results as AdminSessionRow[], attempts: attempts.results as LoginAttempt[] }
}
