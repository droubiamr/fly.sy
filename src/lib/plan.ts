import type { Arrival, Departure, Entry, Mode, OriginDef, Passport, Roads, Route, Status } from "./types"

export type PlanInput = {
  arrivals: Arrival[]
  entries: Record<string, Entry>
  roads: Roads
  from: Pick<OriginDef, "id" | "group">
  dest: string
  passport: Passport
}

/** The other direction: from a Syrian city, out to a country. */
export type PlanOutInput = {
  departures: Departure[]
  entries: Record<string, Entry>
  roads: Roads
  /** The Syrian city you leave from (a city id). */
  origin: string
  to: Pick<OriginDef, "id" | "group">
  passport: Passport
}

export type Journey = Route & {
  /** The country at the other end: where an arrival starts, where a departure goes (an origin id or a group). */
  end: string
  entryData: Entry
  /** The road between the entry point and the Syrian city: after the border coming in, before it going out. */
  roadHours: number | null
  totalHours: number | null
  blocked: boolean
}

/** Every row for this country (filed under it or under a group it belongs to), joined to the road leg between its
 *  entry point and the Syrian city, flagged when the entry is closed to this passport, sorted by total time with
 *  closed routes after the ones that run, and blocked and unknown-time journeys last. */
function ranked<T extends Route>(
  rows: T[],
  end: (r: T) => string,
  { entries, roads, country, city, passport }: { entries: Record<string, Entry>; roads: Roads; country: Pick<OriginDef, "id" | "group">; city: string; passport: Passport },
): Journey[] {
  const out: Journey[] = []
  for (const r of rows) {
    const e = end(r)
    if ((e !== country.id && e !== country.group) || r.hidden) continue
    const entryData = entries[r.entry]
    if (!entryData) continue
    const roadHours = roads[r.entry]?.[city] ?? null
    const blocked = Boolean(entryData.syriansOnly && passport !== "sy")
    const totalHours = roadHours == null ? null : Math.round((r.hours + roadHours) * 10) / 10
    out.push({ ...r, end: e, entryData, roadHours, totalHours, blocked })
  }
  // A closed route stays listed, so travellers see what stopped, but never outranks one that runs.
  const tier = (j: Journey) => (j.blocked ? 2 : j.status === "closed" ? 1 : 0)
  return out.sort((x, y) => tier(x) - tier(y) || (x.totalHours ?? Infinity) - (y.totalHours ?? Infinity))
}

/** Pure planner: every way from a country into a Syrian city. */
export function plan(input: PlanInput): Journey[] {
  return ranked(input.arrivals, (a) => a.from, { ...input, country: input.from, city: input.dest })
}

/** Every way out from a Syrian city to a country: the road to the airport or crossing first, then the flight or the
 *  drive beyond the border. Only departures checked on their own are used; an arrival is never turned around. */
export function planOut(input: PlanOutInput): Journey[] {
  return ranked(input.departures, (d) => d.to, { ...input, country: input.to, city: input.origin })
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
  /** A flight on the way: every airport, and a land crossing in another country than the one at the other end (Germany → Beirut → Jdeidet Yabous). */
  fly: boolean
  /** A real drive: a land crossing, or an airport in another city than the Syrian one. */
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

/** Groups a plan's journeys by entry point, in the plan's own order, so the fastest way comes first. `dest` is the
 *  Syrian city at either end of the trip. */
export function groupWays(list: Journey[], dest: string): Way[] {
  const byEntry = new Map<string, Journey[]>()
  for (const j of list) byEntry.set(j.entry, [...(byEntry.get(j.entry) ?? []), j])
  return [...byEntry.entries()].map(([entry, js]) => {
    const e = js[0].entryData
    const status = e.status === "closed" ? "closed" : STATUS_RANK.find((s) => js.some((j) => j.status === s)) ?? "unknown"
    // A crossing with no country on record is taken as a drive: a flight is never invented.
    const fly = e.kind === "air" || (e.country != null && js.some((j) => j.end !== e.country))
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

/** For every country: whether any way out of Syria to it runs or might (a departure that is not closed). A
 *  country with none is greyed out in the "to" list of a leaving page; its page still says what we know. */
export function countryReach(departures: Departure[], origins: Pick<OriginDef, "id" | "group">[]): Record<string, boolean> {
  const live = departures.filter((d) => !d.hidden && d.status !== "closed")
  return Object.fromEntries(origins.map((o) => [o.id, live.some((d) => d.to === o.id || d.to === o.group)]))
}
