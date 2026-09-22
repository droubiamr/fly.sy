import { DATA, cityById } from "@/lib/data"
import type { Locale } from "@/lib/types"

const W = 620
const H = 480
const P = (lat: number, lng: number) => [(lng - 35.25) * 0.819 * 86 + 14, (37.55 - lat) * 86 + 14] as const
const BORDER: [number, number][] = [
  [35.92, 35.9], [36.25, 36.4], [36.6, 36.55], [36.85, 37.6], [36.72, 38.8], [37.05, 40.1], [37.1, 41.3],
  [37.1, 42.36], [36.3, 41.3], [35.4, 41.25], [34.35, 41.05], [33.6, 39.0], [33.37, 38.79], [32.55, 37.2],
  [32.31, 36.83], [32.65, 36.05], [33.25, 35.77], [33.9, 36.05], [34.62, 36.4], [34.63, 35.98], [35.0, 35.88],
  [35.55, 35.78],
]

const GAP = 9 // dot to label
const LINE = 13 // label height, and the step used when one has to move
// Label width, estimated rather than measured: this renders on the server, where
// there is no text metric. Short words cost proportionally more than long ones,
// hence the base. Both numbers are deliberately generous — over-estimating costs
// an unnecessary 13px nudge, under-estimating puts two labels on top of each other.
const PAD = 12
const CHAR = 7

type Placed = { x: number; y: number; text: string; live: boolean; entry: boolean }

/**
 * Lays out the labels so none sits on top of another. Each is offered its
 * natural spot beside its dot first, then positions further above and below,
 * and takes the first that is free. Callers pass them most-important-first, so
 * the ones that matter keep the spot next to their own dot.
 */
type Box = { l: number; r: number; t: number; b: number }

function place(labels: Placed[], rtl: boolean, dots: Box[]): Placed[] {
  const out: Placed[] = []
  const boxOf = (l: { x: number; y: number; text: string }, dy: number) => {
    const w = PAD + l.text.length * CHAR
    const near = rtl ? l.x - GAP - w : l.x + GAP
    return { l: near, r: near + w, t: l.y + dy - LINE / 2, b: l.y + dy + LINE / 2 }
  }
  const hits = (a: Box, b: Box) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b

  // The dots are obstacles too: a label reading across someone else's dot is as
  // bad as one reading across another label. A label never collides with its own
  // dot, which sits GAP away from where the label starts.
  const taken: Box[] = [...dots]
  for (const l of labels) {
    let dy = 0
    for (const candidate of [0, LINE, -LINE, LINE * 2, -LINE * 2, LINE * 3, -LINE * 3]) {
      if (!taken.some((t) => hits(boxOf(l, candidate), t))) {
        dy = candidate
        break
      }
      dy = candidate // if nothing is free, keep the last try rather than stacking at 0
    }
    taken.push(boxOf(l, dy))
    out.push({ ...l, y: l.y + dy })
  }
  return out
}

/** Schematic map: entry points that serve the chosen journey light up; the destination is the green dot. */
export function SyriaMap({ dest, liveEntries, locale }: { dest: string; liveEntries: string[]; locale: Locale }) {
  const d = cityById(dest)
  if (!d) return null
  const dp = P(d.lat, d.lng)
  const live = new Set(liveEntries)
  const path = "M" + BORDER.map(([a, b]) => P(a, b).map((v) => v.toFixed(1)).join(",")).join("L") + "Z"

  // SVG text anchors at its start edge, which is the right edge in Arabic, so a
  // label offset to the right of its dot runs back across the map. Mirror the
  // offset instead and every label sits beside its own dot in both directions.
  const rtl = locale === "ar"
  const dx = rtl ? -GAP : GAP

  const entryLabels = Object.entries(DATA.entries)
    .filter(([id]) => live.has(id))
    .map(([, e]) => {
      const p = P(e.lat, e.lng)
      return { x: p[0], y: p[1] + 4, text: e.name[locale], live: true, entry: true }
    })
  const cityLabels = DATA.cities.map((c) => {
    const p = P(c.lat, c.lng)
    return { x: p[0], y: p[1] + 4, text: c.name[locale], live: c.id === dest, entry: false }
  })
  // The destination and the entry points that serve it are the point of the
  // map, so they are placed first and keep the spot beside their own dot.
  const dots: Box[] = [
    ...Object.values(DATA.entries).map((e) => P(e.lat, e.lng)),
    ...DATA.cities.map((c) => P(c.lat, c.lng)),
  ].map(([x, y]) => ({ l: x - 7, r: x + 7, t: y - 7, b: y + 7 }))
  const labels = place(
    [...cityLabels.filter((l) => l.live), ...entryLabels, ...cityLabels.filter((l) => !l.live)],
    rtl,
    dots,
  )

  return (
    <div className="rounded-2xl border bg-muted p-1.5">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Syria">
        <path d={path} className="fill-card stroke-border" strokeWidth="2" strokeLinejoin="round" />
        {Object.entries(DATA.entries).map(([id, e]) => {
          const p = P(e.lat, e.lng)
          const on = live.has(id)
          return (
            <g key={id}>
              {on && (
                <path
                  d={`M${p[0].toFixed(1)},${p[1].toFixed(1)} L${dp[0].toFixed(1)},${dp[1].toFixed(1)}`}
                  className="stroke-muted-foreground"
                  strokeWidth="1.5"
                  strokeDasharray="3 4"
                  fill="none"
                />
              )}
              <circle cx={p[0]} cy={p[1]} r={on ? 5 : 2.5} className={on ? "fill-status-caution" : "fill-muted-foreground"} />
            </g>
          )
        })}
        {DATA.cities.map((c) => {
          const p = P(c.lat, c.lng)
          const on = c.id === dest
          return (
            <circle key={c.id} cx={p[0]} cy={p[1]} r={on ? 6 : 2.5} className={on ? "fill-primary" : "fill-muted-foreground"} />
          )
        })}
        {labels.map((l) => (
          <text
            key={(l.entry ? "e:" : "c:") + l.text}
            x={l.x + dx}
            y={l.y}
            className={l.live || l.entry ? "fill-foreground text-[11px] font-semibold" : "fill-muted-foreground text-[11px]"}
          >
            {l.text}
          </text>
        ))}
      </svg>
    </div>
  )
}
