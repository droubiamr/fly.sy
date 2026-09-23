import sources from "../../data/sources.json"
import airlines from "../../data/airlines.json"
import cities from "../../data/cities.json"
import entries from "../../data/entries.json"
import arrivals from "../../data/arrivals.json"
import roads from "../../data/roads.json"
import needs from "../../data/needs.json"
import seedReports from "../../data/reports.seed.json"
import meta from "../../data/meta.json"
import type { Airline, Arrival, City, Entry, Needs, Report, Roads, Source } from "./types"

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

export const ORIGINS = [
  { id: "tr", name: { ar: "تركيا", en: "Türkiye" } },
  { id: "lb", name: { ar: "لبنان", en: "Lebanon" } },
  { id: "jo", name: { ar: "الأردن", en: "Jordan" } },
  { id: "gulf", name: { ar: "الخليج", en: "the Gulf" } },
  { id: "iq", name: { ar: "العراق", en: "Iraq" } },
  { id: "ru", name: { ar: "روسيا", en: "Russia" } },
  { id: "ly", name: { ar: "ليبيا", en: "Libya" } },
  { id: "am", name: { ar: "أرمينيا", en: "Armenia" } },
  { id: "eu", name: { ar: "أوروبا", en: "Europe" } },
] as const

export const PASSPORTS = [
  { id: "sy", name: { ar: "جواز سوري", en: "a Syrian passport" } },
  { id: "voa", name: { ar: "جواز يأخذ تأشيرة عند الوصول", en: "a visa-on-arrival passport" } },
  { id: "res", name: { ar: "جواز يحتاج موافقة مسبقة", en: "a passport needing pre-approval" } },
] as const

export const cityById = (id: string) => DATA.cities.find((c) => c.id === id)
