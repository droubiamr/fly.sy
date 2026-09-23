"use client"

import { useId, useState } from "react"
import { niceScale, type Bucket, type Point } from "@/lib/analytics"
import { cn } from "@/lib/utils"

const nf = new Intl.NumberFormat("en-GB")
const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })
const hourFmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })
// Weekday and date formatted apart and joined by hand: Node and Chromium disagree on the comma between them,
// and the table is rendered on the server and hydrated in the browser.
const weekdayFmt = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" })
const fullDate = (d: Date) => `${weekdayFmt.format(d)} ${dayFmt.format(d)}`

const PLOT_H = 208

/**
 * Page views per bucket as thin columns in the brand green, one series, so no legend: the title names it.
 * Each column slot is its own hover target and the plot takes arrow keys, so the tooltip is reachable
 * without a mouse; the same numbers are in the table underneath.
 */
export function ViewsChart({ points, bucket }: { points: Point[]; bucket: Bucket }) {
  const [active, setActive] = useState<number | null>(null)
  const tableId = useId()
  const { top, step } = niceScale(Math.max(0, ...points.map((p) => p.views)))
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step)
  const label = (t: string) => (bucket === "hour" ? hourFmt.format(new Date(t)) : dayFmt.format(new Date(t)))
  const long = (t: string) =>
    bucket === "hour" ? `${fullDate(new Date(t))}, ${hourFmt.format(new Date(t))} UTC` : fullDate(new Date(t))

  // About six dates along the bottom, always including the last one.
  const every = Math.max(1, Math.ceil(points.length / 6))
  const shown = new Set(points.map((_, i) => i).filter((i) => (points.length - 1 - i) % every === 0))

  const cur = active === null ? null : points[active]
  const empty = points.every((p) => p.views === 0)

  function onKey(e: React.KeyboardEvent) {
    if (!points.length) return
    const last = points.length - 1
    const i = active ?? last
    const next =
      e.key === "ArrowLeft" ? Math.max(0, i - 1)
      : e.key === "ArrowRight" ? Math.min(last, i + 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null
    if (next === null) return
    e.preventDefault()
    setActive(next)
  }

  return (
    <figure className="flex flex-col gap-4">
      <div className="flex">
        {/* Y axis: the ticks carry the values no column is labelled with. */}
        <div className="relative w-10 shrink-0 tabular-nums" style={{ height: PLOT_H }} aria-hidden="true">
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute end-2 -translate-y-1/2 text-[11px] text-muted-foreground"
              style={{ top: PLOT_H - (t / top) * PLOT_H }}
            >
              {nf.format(t)}
            </span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          <div
            role="group"
            aria-label="Page views chart. Use the arrow keys to read each column."
            aria-describedby={tableId}
            tabIndex={0}
            onKeyDown={onKey}
            onFocus={() => setActive((a) => a ?? points.length - 1)}
            onBlur={() => setActive(null)}
            onPointerLeave={() => setActive(null)}
            className="relative rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            style={{ height: PLOT_H }}
          >
            {/* Hairline grid, solid, one step off the surface. */}
            {ticks.map((t) => (
              <div
                key={t}
                aria-hidden="true"
                className={cn("absolute inset-x-0 h-px", t === 0 ? "bg-foreground/25" : "bg-border")}
                style={{ top: PLOT_H - (t / top) * PLOT_H - (t === 0 ? 1 : 0) }}
              />
            ))}

            <div className="absolute inset-0 flex items-end gap-0.5">
              {points.map((p, i) => (
                <div
                  key={p.t}
                  onPointerEnter={() => setActive(i)}
                  className="flex h-full min-w-0 flex-1 items-end justify-center"
                >
                  <div
                    className={cn(
                      "w-full max-w-6 rounded-t-[4px] bg-primary transition-opacity duration-150",
                      active !== null && active !== i && "opacity-45",
                    )}
                    style={{ height: `${(p.views / top) * 100}%` }}
                  />
                </div>
              ))}
            </div>

            {empty && (
              <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                No page views in this period yet.
              </p>
            )}

            {cur && active !== null && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-0 z-10 min-w-32 rounded-lg border bg-popover px-3 py-2 text-popover-foreground"
                style={{
                  left: `${((active + 0.5) / points.length) * 100}%`,
                  transform: `translateX(${active / points.length < 0.2 ? "-10%" : active / points.length > 0.8 ? "-90%" : "-50%"})`,
                }}
              >
                <p className="text-[15px] font-semibold">
                  {nf.format(cur.views)} <span className="text-xs font-normal text-muted-foreground">views</span>
                </p>
                <p className="text-sm font-medium">
                  {nf.format(cur.visitors)} <span className="text-xs font-normal text-muted-foreground">visitors</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{long(cur.t)}</p>
              </div>
            )}
          </div>

          <p className="sr-only" aria-live="polite">
            {cur ? `${long(cur.t)}: ${nf.format(cur.views)} views, ${nf.format(cur.visitors)} visitors` : ""}
          </p>

          {/* X axis band sits inside the figure, so nothing is cut off. */}
          <div className="relative mt-2 h-4" aria-hidden="true">
            {points.map((p, i) =>
              shown.has(i) ? (
                <span
                  key={p.t}
                  className="absolute -translate-x-1/2 text-[11px] whitespace-nowrap text-muted-foreground tabular-nums last:-translate-x-full"
                  style={{ left: `${((i + 0.5) / points.length) * 100}%` }}
                >
                  {label(p.t)}
                </span>
              ) : null,
            )}
          </div>
        </div>
      </div>

      <details className="group text-sm">
        <summary className="inline-flex h-11 cursor-pointer items-center text-muted-foreground hover:text-foreground">
          Show as table
        </summary>
        <div className="max-h-72 overflow-auto rounded-lg border">
          <table id={tableId} className="w-full text-start tabular-nums">
            <caption className="sr-only">Page views and visitors per {bucket}</caption>
            <thead className="sticky top-0 bg-muted text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="px-3 py-2 text-start font-medium">
                  {bucket === "hour" ? "Hour (UTC)" : "Day (UTC)"}
                </th>
                <th scope="col" className="px-3 py-2 text-end font-medium">Views</th>
                <th scope="col" className="px-3 py-2 text-end font-medium">Visitors</th>
              </tr>
            </thead>
            <tbody>
              {[...points].reverse().map((p) => (
                <tr key={p.t} className="border-t">
                  <td className="px-3 py-1.5">{long(p.t)}</td>
                  <td className="px-3 py-1.5 text-end">{nf.format(p.views)}</td>
                  <td className="px-3 py-1.5 text-end">{nf.format(p.visitors)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  )
}
