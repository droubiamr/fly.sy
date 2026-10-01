/**
 * The prerendered page a request would end up at after src/proxy.ts, as Next names it (`/ar/crossings`), or
 * null where the proxy redirects or the path is not part of the localized tree. Arabic lives at the root and is
 * rewritten to /ar; English passes through under /en. worker.ts serves only paths that are also in the list of
 * prerendered pages, so a miss here just means Next answers, as it always did.
 */
export function pageKey(pathname: string, search: URLSearchParams): string | null {
  if (/^\/(admin|api)(\/|$)/.test(pathname)) return null
  // Old planner links (/?from=…) redirect to their page.
  if ((pathname === "/" || pathname === "/en" || pathname === "/ar") && (search.has("from") || search.has("to") || search.has("p")))
    return null
  // /ar/… redirects to the root; a trailing slash redirects to the path without it.
  if (pathname === "/ar" || pathname.startsWith("/ar/")) return null
  if (pathname !== "/" && pathname.endsWith("/")) return null
  if (pathname === "/en" || pathname.startsWith("/en/")) return pathname
  return pathname === "/" ? "/ar" : `/ar${pathname}`
}

/** The asset name of a prefetch segment: its key (`/$d$lang/!KHNpdGUp/news/__PAGE__`) in URL-safe base64. */
export const segmentFile = (segment: string): string =>
  btoa(segment).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "")
