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
      url.pathname = (pathname === "/en" ? "/en" : "") + routePath(origin.id, dest, passport)
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

export const config = {
  // Everything except Next internals and the files really served from public/ or the
  // metadata routes, plus the Search Console verification file. A stray /x.txt therefore
  // still gets a localized 404, not a copy of a page.
  matcher: [
    "/((?!_next/|fonts/|airlines/.*\\.png|favicon\\.ico|icon\\.svg|icon|apple-icon|opengraph-image|icon-192\\.png|icon-512\\.png|icon-maskable-512\\.png|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|google[0-9a-f]+\\.html).*)",
  ],
}
