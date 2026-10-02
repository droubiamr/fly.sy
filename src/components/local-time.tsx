"use client"

import { useId } from "react"
import { DATE_TIME, INTL_LOCALE, formatDateTime } from "@/lib/format"
import type { Locale } from "@/lib/types"

/**
 * A UTC timestamp shown on the reader's own clock: "2 Oct 2026, 08:58 CEST" in Berlin,
 * "09:58 GMT+3" in Damascus. Pages are prerendered, so the HTML carries it in UTC and an
 * inline script rewrites it to local time before the first paint; on a client-side
 * navigation this component formats it in the browser directly. This is the Next.js
 * "Preventing flash before hydration" pattern, and `suppressHydrationWarning` keeps the
 * script's text. Readers without JavaScript see the UTC time, labelled.
 */
export function LocalTime({ iso, locale }: { iso: string; locale: Locale }) {
  const id = useId()
  const server = typeof window === "undefined"
  const script = `{var n=document.getElementById(${JSON.stringify(id)});if(n)n.textContent=new Date(${JSON.stringify(iso)}).toLocaleString(${JSON.stringify(INTL_LOCALE[locale])},${JSON.stringify(DATE_TIME)})}`
  return (
    <>
      <time id={id} dateTime={iso} suppressHydrationWarning>
        {formatDateTime(iso, locale, server ? "UTC" : undefined)}
      </time>
      {/* text/plain once on the client: React warns about rendering a live script, and it has already run. */}
      <script
        type={server ? "text/javascript" : "text/plain"}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: script }}
      />
    </>
  )
}
