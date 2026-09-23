import type { Arrival, Entry, OriginDef, Passport, Roads } from "./types"

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
 *  the entry is closed to this passport, sorted by total time with blocked and
 *  unknown-time journeys last. */
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
  return out.sort(
    (x, y) => Number(x.blocked) - Number(y.blocked) || (x.totalHours ?? Infinity) - (y.totalHours ?? Infinity),
  )
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
