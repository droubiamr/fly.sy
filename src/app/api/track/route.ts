import { getCloudflareContext } from "@opennextjs/cloudflare"
import { NextResponse, userAgent, type NextRequest } from "next/server"
import {
  clientIp,
  countryFrom,
  deviceFrom,
  isVisitorId,
  localeOfPath,
  normalizePath,
  shortName,
  sourceFrom,
  VISITOR_COOKIE,
  VISITOR_COOKIE_MAX_AGE,
} from "@/lib/analytics"
import { currentAdmin } from "@/lib/admin-auth"
import { db } from "@/lib/db"
import { SITE_URL } from "@/lib/site"

type Cf = { country?: string; region?: string; city?: string; asn?: number; asOrganization?: string }

/**
 * Records one page view, sent by <VisitTracker> after each navigation. Always answers 204 so a failure here
 * never shows up on the page. Sets the first-party visitor cookie on the first view, except when the browser
 * sends Global Privacy Control, which gets a view without a visitor id.
 */
export async function POST(req: NextRequest) {
  const done = () => new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } })

  // Only the site's own pages post here. Browsers too old for Sec-Fetch-Site still send Origin on a POST.
  const site = req.headers.get("sec-fetch-site")
  const origin = req.headers.get("origin")
  if (site ? site !== "same-origin" : origin !== req.nextUrl.origin) return done()

  // Headless browsers are scrapers, previews and uptime checks, never a person; isBot does not catch them.
  const ua = userAgent(req)
  if (ua.isBot || /headless|lighthouse|pingdom|uptimerobot|statuscake/i.test(ua.ua)) return done()

  // The owner's own browsing does not count while signed in to the dashboard.
  if (await currentAdmin()) return done()

  // A real view is well under a kilobyte.
  if (Number(req.headers.get("content-length") ?? 0) > 4096) return done()
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return done()
  }
  if (!body || typeof body !== "object") return done()
  const path = normalizePath(body.path)
  if (!path) return done()

  const res = done()
  const gpc = req.headers.get("sec-gpc") === "1"
  const existing = req.cookies.get(VISITOR_COOKIE)?.value
  let visitorId: string | null = null
  let newVisitor = false

  if (gpc) {
    if (existing) res.cookies.delete(VISITOR_COOKIE)
  } else {
    visitorId = isVisitorId(existing) ? existing : crypto.randomUUID()
    newVisitor = visitorId !== existing
    // Refreshed on every view, so it lapses only after 400 days without a visit.
    res.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      secure: req.nextUrl.protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: VISITOR_COOKIE_MAX_AGE,
    })
  }

  const d = db()
  if (!d) return res

  let cf: Cf = {}
  try {
    cf = (getCloudflareContext().cf ?? {}) as Cf
  } catch {}

  try {
    await d
      .prepare(
        `insert into page_views (ts, path, locale, source, ip, country, region, city, asn, as_org, user_agent, device, browser, os, visitor_id, new_visitor)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        Date.now(),
        path,
        localeOfPath(path),
        sourceFrom(body.ref, body.utm, [new URL(SITE_URL).hostname, req.nextUrl.hostname]),
        clientIp(req.headers),
        countryFrom(cf.country ?? req.headers.get("cf-ipcountry")),
        cf.region?.slice(0, 80) ?? null,
        cf.city?.slice(0, 80) ?? null,
        typeof cf.asn === "number" ? cf.asn : null,
        cf.asOrganization?.slice(0, 120) ?? null,
        ua.ua ? ua.ua.slice(0, 500) : null,
        deviceFrom(ua.device.type),
        shortName(ua.browser.name),
        shortName(ua.os.name),
        visitorId,
        newVisitor ? 1 : 0,
      )
      .run()
  } catch (e) {
    console.error("page view not recorded:", e)
  }
  return res
}
