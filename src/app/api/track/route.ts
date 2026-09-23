import { NextResponse, userAgent, type NextRequest } from "next/server"
import {
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
import { ADMIN_COOKIE, verifySession } from "@/lib/admin-token"
import { adminPassword } from "@/lib/admin-auth"
import { SITE_URL } from "@/lib/site"
import { supabaseAdmin } from "@/lib/supabase/admin"

/**
 * Records one page view, sent by <VisitTracker> after each navigation. Always answers 204 so a failure here
 * never shows up on the page. Sets the first-party visitor cookie on the first view, except when the browser
 * sends Global Privacy Control, which gets an anonymous view and no cookie.
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
  const pw = adminPassword()
  if (pw && (await verifySession(pw, req.cookies.get(ADMIN_COOKIE)?.value))) return done()

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

  const sb = supabaseAdmin()
  if (!sb) return res

  const { error } = await sb.from("page_views").insert({
    path,
    locale: localeOfPath(path),
    source: sourceFrom(body.ref, body.utm, [new URL(SITE_URL).hostname, req.nextUrl.hostname]),
    country: countryFrom(req.headers.get("cf-ipcountry")),
    device: deviceFrom(ua.device.type),
    browser: shortName(ua.browser.name),
    os: shortName(ua.os.name),
    visitor_id: visitorId,
    new_visitor: newVisitor,
  })
  if (error) console.error("page view not recorded:", error.message)
  return res
}
