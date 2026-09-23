"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

/**
 * Posts one page view to /api/track per navigation. The referrer and utm_source only describe how the visit
 * started, so they go with the first view of a page load and not with the client-side navigations after it.
 * Renders nothing, loads nothing from a third party, and never throws into the page.
 */
export function VisitTracker() {
  const pathname = usePathname()
  const last = useRef<string | null>(null)

  useEffect(() => {
    // Dev mode runs effects twice; one view per path change is the rule.
    if (last.current === pathname) return
    const first = last.current === null
    last.current = pathname
    const body = JSON.stringify({
      path: pathname,
      ref: first ? document.referrer : "",
      utm: first ? new URLSearchParams(location.search).get("utm_source") : null,
    })
    fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(
      () => {},
    )
  }, [pathname])

  return null
}
