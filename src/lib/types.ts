export type Locale = "ar" | "en"
export type Text = Record<Locale, string>

export type Status = "open" | "caution" | "closed" | "unknown"
export type Confidence = "verified" | "reported" | "unconfirmed"
export type Mode = "air" | "land"
export type Passport = "sy" | "voa" | "res"
/** ISO 3166-1 alpha-2 code of a country you can start from; see data/origins.json. */
export type Origin = string
export type Region = "near" | "gulf" | "europe" | "other"
export type OriginDef = {
  id: Origin
  name: Text
  /** UN M49 numeric code, as a string with its leading zeros: the id the world atlas uses. */
  m49: string
  /** [lng, lat] of the country's main airport: where the route on the map starts. */
  hub: [number, number]
  region: Region
  /** Arrivals filed under this group apply to every country in it, e.g. "eu". */
  group?: string
}

export type Source = {
  name: Text
  kind: Text
  use: Text
  /** Where the source publishes: an https URL, or a site path such as "/reports". Absent for sources with no single home. */
  url?: string
}
export type Airline = { name: Text; country: string }
export type City = { id: string; name: Text; lat: number; lng: number }
export type Entry = {
  kind: Mode
  name: Text
  lat: number
  lng: number
  status: Status
  source: string
  seen: string
  /** Air entries only: the id in cities.json of the city the airport serves. The destination picker lists airports and routes to this city. */
  city?: string
  country?: string
  syriansOnly?: boolean
  note?: Text
}
export type Arrival = {
  airline: string | null
  city: Text
  country: string
  entry: string
  /** An origin id, or a group shared by several origins (see OriginDef.group). */
  from: string
  mode: Mode
  hours: number
  status: Status
  confidence: Confidence
  source: string
  seen: string
  note?: Text
  hidden?: boolean
}
export type Need = { source: string; text: Text }
export type Needs = Record<Mode, Record<Passport, Need[]>>
export type Roads = Record<string, Record<string, number>>

export type Report = {
  id: string
  entry: string
  travelled_on: string
  wait_minutes: number | null
  passport: Passport
  note: Text | string
  status: "pending" | "published" | "rejected"
  editor_verified?: boolean
}
