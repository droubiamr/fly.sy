"use client"

import { useId, useLayoutEffect, useRef } from "react"
import { DATE_TIME, INTL_LOCALE, formatDate, formatDateTime, timeAgo } from "@/lib/format"
import type { Locale } from "@/lib/types"

/**
 * A UTC timestamp on the reader's own clock, and how long ago it was: "2 Oct 2026, 08:58
 * (2 hours ago)" in Berlin, "09:58" in Damascus. Pages are prerendered, so the HTML carries
 * only the day (all a reader without JavaScript sees) and an inline script writes the rest
 * before the first paint; on a client-side navigation this component formats it in the
 * browser directly. This is the Next.js "Preventing flash before hydration" pattern, and
 * `suppressHydrationWarning` keeps the script's text.
 */
export function LocalTime({ iso, locale }: { iso: string; locale: Locale }) {
  const id = useId()
  const ago = useRef<HTMLSpanElement>(null)
  // "(2 hours ago)" depends on when the page is read, so React never renders it: the
  // empty innerHTML keeps hydration off the script's text, and this keeps it true once a
  // minute in a tab left open (and fills it in after a client-side navigation).
  useLayoutEffect(() => {
    const show = () => {
      if (ago.current) ago.current.textContent = `(${timeAgo(iso, INTL_LOCALE[locale], Date.now())})`
    }
    show()
    const tick = setInterval(show, 60_000)
    return () => clearInterval(tick)
  }, [iso, locale])
  const server = typeof window === "undefined"
  const loc = JSON.stringify(INTL_LOCALE[locale])
  const script =
    `{var t=document.getElementById(${JSON.stringify(id)}),a=document.getElementById(${JSON.stringify(`${id}ago`)});` +
    `if(t)t.textContent=new Date(${JSON.stringify(iso)}).toLocaleString(${loc},${JSON.stringify(DATE_TIME)});` +
    `if(a)a.textContent="("+(${timeAgo})(${JSON.stringify(iso)},${loc},Date.now())+")"}`
  return (
    <>
      <time id={id} dateTime={iso} suppressHydrationWarning>
        {server ? formatDate(iso, locale) : formatDateTime(iso, locale)}
      </time>{" "}
      <span
        id={`${id}ago`}
        ref={ago}
        className="font-normal whitespace-nowrap text-muted-foreground"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: "" }}
      />
      {/* text/plain once on the client: React warns about rendering a live script, and it has already run. */}
      <script
        type={server ? "text/javascript" : "text/plain"}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: script }}
      />
    </>
  )
}
