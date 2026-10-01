import type { Arrival, Entry, Mode, OriginDef, Passport, Roads, Status } from "./types"

export type PlanInput = {
  arrivals: Arrival[]
  entries: Record<string, Entry>
  roads: Roads
  from: Pick<OriginDef, "id" | "group">
  dest: string
  passport: Passport
}

export type Journey = Arrival & {
  entryData: Entry
  roadHours: number | null
  totalHours: number | null
  blocked: boolean
}

/** Pure planner: every arrival from `from` (filed under the country itself or
 *  under a group it belongs to), joined to the road leg to `dest`, flagged when
 *  the entry is closed to this passport, sorted by total time with closed routes
 *  after the ones that run, and blocked and unknown-time journeys last. */
export function plan(input: PlanInput): Journey[] {
  const out: Journey[] = []
  const { id, group } = input.from
  for (const a of input.arrivals) {
    if ((a.from !== id && a.from !== group) || a.hidden) continue
    const entryData = input.entries[a.entry]
    if (!entryData) continue
    const roadHours = input.roads[a.entry]?.[input.dest] ?? null
    const blocked = Boolean(entryData.syriansOnly && input.passport !== "sy")
    const totalHours = roadHours == null ? null : Math.round((a.hours + roadHours) * 10) / 10
    out.push({ ...a, entryData, roadHours, totalHours, blocked })
  }
  // A closed route stays listed, so travellers see what stopped, but never outranks one that runs.
  const tier = (j: Journey) => (j.blocked ? 2 : j.status === "closed" ? 1 : 0)
  return out.sort((x, y) => tier(x) - tier(y) || (x.totalHours ?? Infinity) - (y.totalHours ?? Infinity))
}

export type Answer = { best: Journey | null; running: number; total: number }

/** The one-line answer a route page opens with: the fastest route running for this passport,
 *  and how many of the routes open to it run at all. Running means open or caution; an open
 *  route is named first, so a conditional one is offered only when nothing simply runs. Routes
 *  of unknown status count as known but never as the answer. */
export function answerFor(journeys: Journey[]): Answer {
  const usable = journeys.filter((j) => !j.blocked)
  const running = usable.filter((j) => j.status === "open" || j.status === "caution")
  const fastest = (s: Status) => running.find((j) => j.status === s && j.totalHours != null)
  return { best: fastest("open") ?? fastest("caution") ?? null, running: running.length, total: usable.length }
}

/** One way into Syria on a route page: every journey through the same entry point, which share the road onward. */
export type Way = {
  entry: string
  mode: Mode
  /** A flight on the way: every airport, and a land crossing in another country than the one you start from (Germany → Beirut → Jdeidet Yabous). */
  fly: boolean
  /** A real drive: a land crossing, or an airport in another city than the destination. */
  drive: boolean
  journeys: Journey[]
  /** The fastest running journey, as answerFor picks it; null when none runs. */
  best: Journey | null
  /** The best status among its journeys, or closed when the entry itself is. */
  status: Status
  /** Closed to this passport on every journey. */
  blocked: boolean
}

const STATUS_RANK: Status[] = ["open", "caution", "unknown", "closed"]

/** Groups a plan's journeys by entry point, in the plan's own order, so the fastest way comes first. */
export function groupWays(journeys: Journey[], dest: string): Way[] {
  const byEntry = new Map<string, Journey[]>()
  for (const j of journeys) byEntry.set(j.entry, [...(byEntry.get(j.entry) ?? []), j])
  return [...byEntry.entries()].map(([entry, js]) => {
    const e = js[0].entryData
    const status = e.status === "closed" ? "closed" : STATUS_RANK.find((s) => js.some((j) => j.status === s)) ?? "unknown"
    // A crossing with no country on record is taken as a drive: a flight is never invented.
    const fly = e.kind === "air" || (e.country != null && js.some((j) => j.from !== e.country))
    return { entry, mode: e.kind, fly, drive: e.kind === "land" || e.city !== dest, journeys: js, best: answerFor(js).best, status, blocked: js.every((j) => j.blocked) }
  })
}

export type Reach = "direct" | "via" | "none"

/** For every airport: "direct" when a flight from `from` lands there, "via"
 *  when only flights from elsewhere do (so a connection is possible), "none"
 *  when it is closed, closed to this passport, or nothing flies there. */
export function airportReach(input: Omit<PlanInput, "roads" | "dest">): Record<string, Reach> {
  const { id, group } = input.from
  const out: Record<string, Reach> = {}
  for (const [code, e] of Object.entries(input.entries)) {
    if (e.kind !== "air") continue
    const blocked = Boolean(e.syriansOnly && input.passport !== "sy")
    if (e.status === "closed" || blocked) {
      out[code] = "none"
      continue
    }
    const flights = input.arrivals.filter((a) => a.entry === code && a.mode === "air" && !a.hidden && a.status !== "closed")
    out[code] = flights.some((a) => a.from === id || a.from === group) ? "direct" : flights.length ? "via" : "none"
  }
  return out
}
