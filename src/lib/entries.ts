import type { Arrival, City, Entry, Mode, Roads } from "./types"

/** Every entry point of one kind, keeping the data file's order. */
export function entriesOfKind(entries: Record<string, Entry>, kind: Mode) {
  return Object.entries(entries).filter(([, e]) => e.kind === kind)
}

/** Public arrivals that land at this entry point, in data order. Hidden rows are declared gaps, not routes. */
export function arrivalsThrough(arrivals: Arrival[], entry: string) {
  return arrivals.filter((a) => a.entry === entry && !a.hidden)
}

/** Road legs from an entry point to every city we know, nearest first. Cities with no estimate are left out. */
export function roadsFrom(roads: Roads, cities: City[], entry: string) {
  const legs = roads[entry] ?? {}
  return cities
    .filter((c) => legs[c.id] != null)
    .map((c) => ({ city: c, hours: legs[c.id] }))
    .sort((a, b) => a.hours - b.hours)
}

/** The section an entry point belongs to, so a link to it is built in one place. */
export const entryHref = (id: string, e: Entry) => (e.kind === "air" ? `/flights/${id}` : `/crossings/${id}`)
