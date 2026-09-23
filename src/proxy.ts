import { NextResponse, type NextRequest } from "next/server"
import { DESTINATIONS, originById, routePath } from "@/lib/data"
import { passportFromSlug } from "@/lib/slugs"

/**
 * Arabic pages live at the root and English under /en, but both are rendered by
 * the same app/[lang] tree. A root request is rewritten to /ar internally (the
 * visible URL does not change); a request that names /ar explicitly is sent to
 * the root so each page has exactly one address.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  // The admin dashboard and the API are English-only and sit outside the localized tree.
  if (/^\/admin(\/|$)/.test(pathname)) return adminHeaders(req)
  if (/^\/api(\/|$)/.test(pathname)) return NextResponse.next()
  // Old planner links carried the answer as a query string; each answer is a page now.
  // Checked before the /ar strip so such a link redirects once, not twice.
  if (pathname === "/" || pathname === "/en" || pathname === "/ar") {
    const q = req.nextUrl.searchParams
    if (q.has("from") || q.has("to") || q.has("p")) {
      const url = req.nextUrl.clone()
      url.search = ""
      const origin = originById(q.get("from") ?? undefined) ?? originById("TR")!
      const to = q.get("to")
      const dest = to && DESTINATIONS.some((d) => d.id === to) ? to : "damascus"
      const p = q.get("p")
      const passport = p === "voa" || p === "res" ? p : passportFromSlug(p ?? "") ?? "sy"
      url.pathname = (pathname === "/en" ? "/en" : "") + routePath(origin.id, dest)
      if (passport !== "sy") url.searchParams.set("p", passport)
      return NextResponse.redirect(url, 308)
    }
  }
  // Passport pages were briefly their own URLs (/…/visa-on-arrival); the passport is a query now.
  const seg = pathname.match(/^(\/en)?(\/from\/[^/]+\/to\/[^/]+)\/([^/]+)\/?$/)
  if (seg) {
    const passport = passportFromSlug(seg[3])
    if (passport) {
      const url = req.nextUrl.clone()
      url.pathname = (seg[1] ?? "") + seg[2]
      if (passport !== "sy") url.searchParams.set("p", passport)
      return NextResponse.redirect(url, 308)
    }
  }
  if (pathname === "/ar" || pathname.startsWith("/ar/")) {
    const url = req.nextUrl.clone()
    url.pathname = pathname.slice(3) || "/"
    return NextResponse.redirect(url, 308)
  }
  if (pathname === "/en" || pathname.startsWith("/en/")) return NextResponse.next()
  const url = req.nextUrl.clone()
  url.pathname = `/ar${pathname}`
  return NextResponse.rewrite(url)
}

/**
 * A strict Content-Security-Policy for the admin pages, with a fresh nonce per request as in the Next.js CSP
 * guide: Next puts the nonce on its own scripts, the login page on the Turnstile script, and nothing else
 * runs. Turnstile's challenge is the one frame allowed. Nothing admin is cached or indexed.
 */
function adminHeaders(req: NextRequest) {
  const nonce = btoa(crypto.randomUUID())
  const dev = process.env.NODE_ENV === "development"
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    // Inline style attributes carry the chart's bar heights; a nonce cannot cover attributes.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-src https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(dev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ")
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-nonce", nonce)
  requestHeaders.set("Content-Security-Policy", csp)
  const res = NextResponse.next({ request: { headers: requestHeaders } })
  res.headers.set("Content-Security-Policy", csp)
  res.headers.set("Cache-Control", "no-store")
  res.headers.set("X-Robots-Tag", "noindex, nofollow")
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin")
  return res
}

export const config = {
  // Everything except Next internals and the files really served from public/ or the
  // metadata routes, plus the Search Console verification file. A stray /x.txt therefore
  // still gets a localized 404, not a copy of a page.
  matcher: [
    "/((?!_next/|fonts/|airlines/.*\\.png|favicon\\.ico|icon\\.svg|icon|apple-icon|opengraph-image|icon-192\\.png|icon-512\\.png|icon-maskable-512\\.png|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|google[0-9a-f]+\\.html).*)",
  ],
}
