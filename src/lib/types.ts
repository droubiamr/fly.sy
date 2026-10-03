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
/** A dated change on the way into Syria, told once, with the post or article it came from. */
export type NewsItem = {
  id: string
  /** YYYY-MM-DD, the date the source published it. */
  date: string
  title: Text
  text: Text
  source: string
  /** The exact post, article or document; the source's home when absent. */
  url?: string
  /** Entry points (entries.json) and carriers (airlines.json) the item is about, linked under it. */
  entries?: string[]
  airlines?: string[]
}
/** How a link reads on the Links page: a website, a page of one, an account on a platform, or an app in a store. */
export type LinkKind = "site" | "page" | "telegram" | "facebook" | "instagram" | "x" | "youtube" | "whatsapp" | "ios" | "android"
/** The sections of the Links page, in the order it shows them. */
export type LinkGroup = "aviation" | "airlines" | "consular" | "visas" | "borders" | "tracking"
export type ResourceLink = {
  kind: LinkKind
  /** One address, or one per language where the site has both. */
  url: string | Text
  /** What a "page" link opens ("Contact"); the other kinds are named by their kind. */
  label?: Text
}
/** One body or tool on the Links page, with the addresses we checked and when. See data/links.json. */
export type Resource = {
  /** Also the card's anchor on the page: /links#damascus-airport. */
  id: string
  group: LinkGroup
  name: Text
  /** What a traveller can do there, in the words of the site itself. */
  use: Text
  links: ResourceLink[]
  /** YYYY-MM-DD, the day every address on the card was last opened and found to be the body's own. */
  seen: string
  /** The page of the body's own website that links to its accounts and apps: how we know they are its own. */
  via?: string
  /** The same body in sources.json, when fly.sy also cites it for facts. */
  source?: string
  /** The airport (entries.json) or carrier (airlines.json) this is the official site of; their pages link here. */
  entry?: string
  airline?: string
  /** Two-letter code of a body outside Syria, shown as a tag. */
  country?: string
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
