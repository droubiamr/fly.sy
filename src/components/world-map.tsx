import { geoBounds, geoEqualEarth, geoGraticule10, geoPath } from "d3-geo"
import { feature, mesh } from "topojson-client"
import type { Feature, FeatureCollection, Geometry, LineString, MultiLineString, Polygon } from "geojson"
import type { GeometryCollection, Topology } from "topojson-specification"
import atlas110 from "world-atlas/countries-110m.json"
import atlas50 from "world-atlas/countries-50m.json"
import { DATA, cityById } from "@/lib/data"
import { arrow } from "@/lib/format"
import type { Locale, OriginDef } from "@/lib/types"

// Natural Earth via the world-atlas package (public domain data, ISC package).
// Two resolutions: the 50m file draws a proper coastline when the frame is a
// few hundred kilometres across, but is eight times the path data when it
// spans Europe, where the 110m file already looks right. Both live only on the
// server; the phone receives the finished SVG.
type Atlas = { countries: FeatureCollection<Geometry>; byId: Map<string, Feature<Geometry>>; borders: MultiLineString }
function load(raw: unknown): Atlas {
  const topo = raw as Topology<{ countries: GeometryCollection }>
  const countries = feature(topo, topo.objects.countries)
  return {
    countries,
    byId: new Map(countries.features.map((f) => [String(f.id), f])),
    borders: mesh(topo, topo.objects.countries, (a, b) => a !== b),
  }
}
const ATLAS = { coarse: load(atlas110), fine: load(atlas50) }
const SYRIA = "760"
const DETAIL_SCALE = 825 // projection scale above which the fine atlas is worth its weight

// A small coordinate space on purpose: the SVG is scaled to the card, and on a
// 390px phone every unit is 0.73px. Type set at 14 here is 10px there and 18px
// on a desktop card, where a map can carry it.
export const W = 480
export const H = 330
const INSET = 16 // units between the frame and the edge
const MARGIN = 0.12 // of the frame, added on every side, in degrees
const MIN_SPAN: [number, number] = [14, 9] // degrees; a frame is never tighter than this

type Scene = {
  land: string
  borders: string
  graticule: string
  origin: string
  syria: string
  scale: number
  /** Pixel position of a point, or null when it falls outside the frame. */
  project: (lngLat: [number, number]) => [number, number] | null
  /** The great circle between two points, clipped to the frame. */
  arc: (a: [number, number], b: [number, number]) => string
}
const scenes = new Map<string, Scene>()

/**
 * Frames the origin's hub and Syria, with the origin country itself when it is
 * compact enough to fit. Countries with far-flung territory (France, Norway
 * with Svalbard, Russia across the antimeridian) would otherwise drag the
 * frame across half the planet; for those the hub stands in.
 */
function scene(o: OriginDef): Scene {
  const hit = scenes.get(o.id)
  if (hit) return hit

  const syria = ATLAS.coarse.byId.get(SYRIA)!
  const origin = ATLAS.coarse.byId.get(o.m49)
  const pts: [number, number][] = [...geoBounds(syria), o.hub]
  if (origin) {
    const b = geoBounds(origin)
    if (b[1][0] - b[0][0] < 25 && b[1][1] - b[0][1] < 20) pts.push(...b)
  }
  let x0 = Math.min(...pts.map((p) => p[0]))
  let x1 = Math.max(...pts.map((p) => p[0]))
  let y0 = Math.min(...pts.map((p) => p[1]))
  let y1 = Math.max(...pts.map((p) => p[1]))
  const mx = Math.max((x1 - x0) * MARGIN, (MIN_SPAN[0] - (x1 - x0)) / 2)
  const my = Math.max((y1 - y0) * MARGIN, (MIN_SPAN[1] - (y1 - y0)) / 2)
  x0 -= mx; x1 += mx; y0 -= my; y1 += my
  // Wound clockwise: d3 reads the other winding as "the whole sphere except this".
  const frame: Polygon = { type: "Polygon", coordinates: [[[x0, y0], [x0, y1], [x1, y1], [x1, y0], [x0, y0]]] }

  const projection = geoEqualEarth()
    .rotate([-(x0 + x1) / 2, 0])
    .fitExtent([[INSET, INSET], [W - INSET, H - INSET]], frame)
    .clipExtent([[0, 0], [W, H]])
  const atlas = projection.scale() >= DETAIL_SCALE ? ATLAS.fine : ATLAS.coarse
  const path = geoPath(projection).digits(1)

  const s: Scene = {
    land: path(atlas.countries) ?? "",
    borders: path(atlas.borders) ?? "",
    graticule: path(geoGraticule10()) ?? "",
    origin: (origin && path(atlas.byId.get(o.m49) ?? origin)) || "",
    syria: path(atlas.byId.get(SYRIA) ?? syria) ?? "",
    scale: projection.scale(),
    project: (p) => {
      const q = projection(p)
      return q && q[0] >= 0 && q[0] <= W && q[1] >= 0 && q[1] <= H ? q : null
    },
    arc: (a, b) => path({ type: "LineString", coordinates: [a, b] } satisfies LineString) ?? "",
  }
  scenes.set(o.id, s)
  return s
}

const GAP = 8
const LINE = 16
const PAD = 12
const CHAR = 8
type Box = { l: number; r: number; t: number; b: number }
type Label = { x: number; y: number; text: string; strong: boolean; side: "start" | "end" }

/**
 * Lays labels out so none sits on another or on a dot. Each is offered the
 * spot beside its own dot first, then rows above and below, and takes the
 * first that is free. Callers pass them most-important-first. Widths are
 * estimated: this renders on the server, where there is no text metric.
 */
function place(labels: Label[], dots: Box[]): Label[] {
  const out: Label[] = []
  const boxOf = (l: Label, dy: number): Box => {
    const w = PAD + l.text.length * CHAR
    const near = l.side === "end" ? l.x - GAP - w : l.x + GAP
    return { l: near, r: near + w, t: l.y + dy - LINE / 2, b: l.y + dy + LINE / 2 }
  }
  const hits = (a: Box, b: Box) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b
  const taken = [...dots]
  for (let l of labels) {
    // The preferred side is a preference, not a right: a name that would run
    // off the edge of the map moves to the other side of its dot.
    const b = boxOf(l, 0)
    if (b.l < 0 || b.r > W) l = { ...l, side: l.side === "end" ? "start" : "end" }
    let dy = 0
    for (const c of [0, LINE, -LINE, LINE * 2, -LINE * 2]) {
      dy = c
      if (!taken.some((t) => hits(boxOf(l, c), t))) break
    }
    taken.push(boxOf(l, dy))
    out.push({ ...l, y: l.y + dy })
  }
  return out
}

/**
 * A real map: the chosen country and Syria on Natural Earth coastlines, with
 * the route drawn as a great circle from the country's main airport to each
 * entry point that serves the journey. Server-rendered SVG, so the map costs
 * the phone no script and no tiles.
 */
export function WorldMap({ origin, dest, liveEntries, locale }: { origin: OriginDef; dest: string; liveEntries: string[]; locale: Locale }) {
  const city = cityById(dest)
  if (!city) return null
  const s = scene(origin)
  const hub = s.project(origin.hub)
  const dp = s.project([city.lng, city.lat])
  const entries = [...new Set(liveEntries)]
    .map((id) => ({ id, e: DATA.entries[id], p: s.project([DATA.entries[id].lng, DATA.entries[id].lat]) }))
    .filter((x): x is typeof x & { p: [number, number] } => x.p !== null)
  // Close in, the entry points are far enough apart to be named; from Europe
  // they sit within a few pixels of each other and the route cards name them.
  const close = s.scale >= 1200

  const dots: Box[] = [hub, dp, ...entries.map((x) => x.p)]
    .filter((p): p is [number, number] => p !== null)
    .map(([x, y]) => ({ l: x - 7, r: x + 7, t: y - 7, b: y + 7 }))
  // Each end of the route is named on the side facing away from the other end,
  // so no label reads across the line.
  const away = (from: [number, number] | null, at: [number, number]): Label["side"] => (from && from[0] < at[0] ? "start" : "end")
  const wanted: Label[] = []
  if (dp) wanted.push({ x: dp[0], y: dp[1] + 5, text: city.name[locale], strong: true, side: away(hub, dp) })
  if (hub) wanted.push({ x: hub[0], y: hub[1] + 5, text: origin.name[locale], strong: true, side: away(dp, hub) })
  if (close) for (const x of entries) wanted.push({ x: x.p[0], y: x.p[1] + 4, text: x.e.name[locale], strong: false, side: x.p[0] < W / 2 ? "start" : "end" })
  const labels = place(wanted, dots)

  return (
    <figure className="overflow-hidden rounded-3xl ring-1 ring-foreground/10">
      <svg
        // A new element per origin, so the route draws itself again when the
        // country changes.
        key={origin.id + ":" + liveEntries.join()}
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full"
        role="img"
        aria-label={`${origin.name[locale]} ${arrow(locale)} ${city.name[locale]}`}
        // Left-to-right geometry regardless of page direction: an anchor of
        // "start" is the left edge, and the label sits where it was measured.
        style={{ direction: "ltr" }}
      >
        {/* Sea darker than land in both schemes: muted is darker than card in
            light, and in dark it is the background that is. */}
        <rect width={W} height={H} className="fill-muted dark:fill-background" />
        <path d={s.graticule} className="stroke-border" fill="none" strokeWidth="0.5" />
        <path d={s.land} className="fill-card" />
        <path d={s.borders} className="stroke-border" fill="none" strokeWidth="0.75" strokeLinejoin="round" />
        {/* Both countries in the one accent at two strengths, so the pair reads
            as "from here, to here" and not as two unrelated highlights. */}
        <path d={s.origin} className="map-rise fill-primary/10 stroke-primary" strokeWidth="1" strokeLinejoin="round" />
        <path d={s.syria} className="fill-primary/25 stroke-primary" strokeWidth="1" strokeLinejoin="round" />

        {hub &&
          entries.map((x) => (
            <path
              key={x.id}
              d={s.arc(origin.hub, [x.e.lng, x.e.lat])}
              pathLength={1}
              className="map-arc stroke-primary"
              fill="none"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          ))}

        {close &&
          entries.map((x) => (
            <circle key={x.id} cx={x.p[0]} cy={x.p[1]} r="3.5" className="map-rise fill-status-caution stroke-card" strokeWidth="1.5" />
          ))}
        {hub && <circle cx={hub[0]} cy={hub[1]} r="4.5" className="map-rise fill-primary stroke-card" strokeWidth="2" />}
        {dp && <circle cx={dp[0]} cy={dp[1]} r="5" className="map-rise fill-primary stroke-card" strokeWidth="2" />}

        {labels.map((l) => (
          <text
            key={l.text}
            x={l.x + (l.side === "end" ? -GAP : GAP)}
            y={l.y}
            textAnchor={l.side}
            className={"map-rise " + (l.strong ? "fill-foreground text-[14px] font-semibold" : "fill-muted-foreground text-[12px]")}
          >
            {l.text}
          </text>
        ))}
      </svg>
    </figure>
  )
}

