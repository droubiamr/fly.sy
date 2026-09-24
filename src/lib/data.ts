import sources from "../../data/sources.json"
import airlines from "../../data/airlines.json"
import cities from "../../data/cities.json"
import entries from "../../data/entries.json"
import arrivals from "../../data/arrivals.json"
import origins from "../../data/origins.json"
import roads from "../../data/roads.json"
import needs from "../../data/needs.json"
import seedReports from "../../data/reports.seed.json"
import meta from "../../data/meta.json"
import type { Airline, Arrival, City, Entry, Needs, Origin, OriginDef, Region, Report, Roads, Source } from "./types"
import { slugify } from "./slugs"

export const DATA = {
  meta: meta as { updated: string; contact: string },
  sources: sources as Record<string, Source>,
  airlines: airlines as Record<string, Airline>,
  cities: cities as City[],
  entries: entries as Record<string, Entry>,
  arrivals: arrivals as Arrival[],
  roads: roads as Roads,
  needs: needs as Needs,
  seedReports: seedReports as Report[],
}

export const ORIGINS = origins as OriginDef[]
/** Dropdown order: nearest first. */
export const REGIONS: Region[] = ["near", "gulf", "europe", "other"]

/** The region ids the planner used before origins were countries. Old shared links still resolve. */
const LEGACY_ORIGINS: Record<string, string> = { tr: "TR", lb: "LB", jo: "JO", gulf: "AE", iq: "IQ", eu: "DE" }
export const originById = (id: string | undefined) =>
  ORIGINS.find((o) => o.id === id) ?? ORIGINS.find((o) => o.id === LEGACY_ORIGINS[id ?? ""])

export const PASSPORTS = [
  { id: "sy", name: { ar: "جواز سوري", en: "a Syrian passport" } },
  { id: "voa", name: { ar: "جواز يأخذ تأشيرة عند الوصول", en: "a visa-on-arrival passport" } },
  { id: "res", name: { ar: "جواز يحتاج موافقة مسبقة", en: "a passport needing pre-approval" } },
] as const

export const cityById = (id: string) => DATA.cities.find((c) => c.id === id)

/**
 * What the destination picker offers: every airport, open or not, in entries.json
 * order, shown by its own name. The value is the city it serves, which is what
 * the planner routes to and what the URL carries, so one city with two airports
 * would appear once, under the first.
 */
export const DESTINATIONS = Object.entries(DATA.entries)
  .filter(([, e]) => e.kind === "air" && e.city)
  .filter(([, e], i, all) => all.findIndex(([, o]) => o.city === e.city) === i)
  .map(([entry, e]) => ({ id: e.city!, entry, name: e.name }))

/* ---- URL slugs, derived from the English names so a rename is a data edit. ---- */

const bySlug = <T,>(rec: Record<string, T>, name: (v: T) => string) => {
  // Null-prototype maps: a slug like "constructor" from the URL must miss, not find Object.
  const forward: Record<string, string> = Object.create(null)
  const back: Record<string, string> = Object.create(null)
  for (const [id, v] of Object.entries(rec)) {
    const s = slugify(name(v))
    forward[id] = s
    back[s] = id
  }
  return { forward, back }
}

const ORIGIN = bySlug(Object.fromEntries(ORIGINS.map((o) => [o.id, o])), (o) => o.name.en)
const ENTRY = bySlug(DATA.entries, (e) => e.name.en)
const AIRLINE = bySlug(DATA.airlines, (a) => a.name.en)

/** "turkiye", "united-arab-emirates": the country as it appears in /from/…. */
export const originSlug = (id: Origin) => ORIGIN.forward[id]
export const originFromSlug = (slug: string) => originById(ORIGIN.back[slug])
export const entrySlug = (id: string) => ENTRY.forward[id]
export const entryFromSlug = (slug: string) => ENTRY.back[slug]
export const airlineSlug = (code: string) => AIRLINE.forward[code]
export const airlineFromSlug = (slug: string) => AIRLINE.back[slug]

export const destinationById = (id: string) => DESTINATIONS.find((d) => d.id === id)

/** /from/turkiye/to/damascus. The passport is a query on the page (?p=voa), never a segment. */
export const routePath = (from: Origin, dest: string) => `/from/${originSlug(from)}/to/${dest}`

/** Airports live under /airports, land crossings under /crossings. */
export const entryPath = (id: string) => `${DATA.entries[id].kind === "air" ? "/airports" : "/crossings"}/${entrySlug(id)}`
export const airlinePath = (code: string) => `/airlines/${airlineSlug(code)}`

export const landEntries = () => Object.entries(DATA.entries).filter(([, e]) => e.kind === "land")
export const airEntries = () => Object.entries(DATA.entries).filter(([, e]) => e.kind === "air")

/** Arrivals through a given entry, visible ones only. */
export const arrivalsVia = (entry: string) => DATA.arrivals.filter((a) => a.entry === entry && !a.hidden)
/** Arrivals flown by a given carrier, visible ones only. */
export const arrivalsBy = (airline: string) => DATA.arrivals.filter((a) => a.airline === airline && !a.hidden)

/** The country a route page for this arrival starts from: the arrival's own, or the first of its group. */
export const originForArrival = (a: Arrival): OriginDef =>
  ORIGINS.find((o) => o.id === a.from) ?? ORIGINS.find((o) => o.group === a.from) ?? ORIGINS[0]

/** The destination a journey through this entry lands at: the airport's city, or the nearest city with an airport. */
export const destinationVia = (entry: string): string => {
  const e = DATA.entries[entry]
  if (e.city && destinationById(e.city)) return e.city
  const ids = new Set(DESTINATIONS.map((d) => d.id))
  const nearest = Object.entries(DATA.roads[entry] ?? {})
    .filter(([c]) => ids.has(c))
    .sort((a, b) => a[1] - b[1])[0]
  return nearest?.[0] ?? "damascus"
}
