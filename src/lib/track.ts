import { userAgentFromString } from "next/dist/server/web/spec-extension/user-agent"
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
} from "./analytics"
import type { D1Database } from "./db"
import { SITE_URL } from "./site"

export type Cf = { country?: string; region?: string; city?: string; asn?: number; asOrganization?: string }

/** One cookie's value from a request, or undefined. */
export function cookieValue(req: Request, name: string): string | undefined {
  for (const part of (req.headers.get("cookie") ?? "").split(";")) {
    const i = part.indexOf("=")
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim()
  }
  return undefined
}

/**
 * Records one page view, sent by <VisitTracker> after each navigation. Always answers 204 so a failure here
 * never shows up on the page. Sets the first-party visitor cookie on the first view, except when the browser
 * sends Global Privacy Control, which gets a view without a visitor id.
 *
 * Plain Request and Response, no Next.js: worker.ts calls it directly so a page view never starts Next (on
 * Workers Free that alone overruns the CPU limit), and app/api/track/route.ts calls it under `next dev` and for
 * a signed-in admin, whose own browsing does not count.
 */
export async function trackView(
  req: Request,
  { db, cf, signedIn }: { db: D1Database | null; cf?: Cf; signedIn: () => Promise<boolean> },
): Promise<Response> {
  const headers = new Headers({ "Cache-Control": "no-store" })
  const done = () => new Response(null, { status: 204, headers })
  const url = new URL(req.url)

  // Only the site's own pages post here. Browsers too old for Sec-Fetch-Site still send Origin on a POST.
  const site = req.headers.get("sec-fetch-site")
  const origin = req.headers.get("origin")
  if (site ? site !== "same-origin" : origin !== url.origin) return done()

  // Headless browsers are scrapers, previews and uptime checks, never a person; isBot does not catch them.
  const ua = userAgentFromString(req.headers.get("user-agent") ?? undefined)
  if (ua.isBot || /headless|lighthouse|pingdom|uptimerobot|statuscake/i.test(ua.ua)) return done()

  // The owner's own browsing does not count while signed in to the dashboard.
  if (await signedIn()) return done()

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

  const gpc = req.headers.get("sec-gpc") === "1"
  const existing = cookieValue(req, VISITOR_COOKIE)
  let visitorId: string | null = null
  let newVisitor = false

  if (gpc) {
    if (existing) headers.append("Set-Cookie", `${VISITOR_COOKIE}=; Path=/; Max-Age=0`)
  } else {
    visitorId = isVisitorId(existing) ? existing : crypto.randomUUID()
    newVisitor = visitorId !== existing
    // Refreshed on every view, so it lapses only after 400 days without a visit.
    const secure = url.protocol === "https:" ? "; Secure" : ""
    headers.append("Set-Cookie", `${VISITOR_COOKIE}=${visitorId}; Path=/; Max-Age=${VISITOR_COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax${secure}`)
  }

  if (!db) return done()
  cf ??= {}

  try {
    await db
      .prepare(
        `insert into page_views (ts, path, locale, source, ip, country, region, city, asn, as_org, user_agent, device, browser, os, visitor_id, new_visitor)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        Date.now(),
        path,
        localeOfPath(path),
        sourceFrom(body.ref, body.utm, [new URL(SITE_URL).hostname, url.hostname]),
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
  return done()
}
