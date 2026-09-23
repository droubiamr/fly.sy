export type Locale = "ar" | "en"
export type Text = Record<Locale, string>

export type Status = "open" | "caution" | "closed" | "unknown"
export type Confidence = "verified" | "reported" | "unconfirmed"
export type Mode = "air" | "land"
export type Passport = "sy" | "voa" | "res"
export type Origin = "tr" | "lb" | "jo" | "gulf" | "iq" | "ru" | "ly" | "eu"

export type Source = { name: Text; kind: Text; use: Text }
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
  country?: string
  syriansOnly?: boolean
  note?: Text
}
export type Arrival = {
  airline: string | null
  city: Text
  country: string
  entry: string
  from: Origin
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
