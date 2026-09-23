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
