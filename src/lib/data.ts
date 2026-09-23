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
import type { Airline, Arrival, City, Entry, Needs, OriginDef, Region, Report, Roads, Source } from "./types"

export const DATA = {
  meta: meta as { updated: string; reportContact: string },
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
