import {
  DATA,
  DESTINATIONS,
  ORIGINS,
  PASSPORTS,
  airEntries,
  airlinePath,
  arrivalsBy,
  arrivalsVia,
  entryPath,
  landEntries,
  routePath,
} from "./data"
import { DATA_FILES, dataFileUrl } from "./open-data"
import { SITE_URL, absoluteUrl } from "./site"
import type { Arrival, Entry } from "./types"
import { getMessages } from "@/messages"

/*
 * /llms.txt and /llms-full.txt (llmstxt.org): the site described for AI
 * assistants in plain Markdown, written from data/ at build time so it can
 * never disagree with the pages. English, because that is what most assistants
 * reason in; every English page named here has an Arabic twin without /en.
 */

const en = (path: string) => absoluteUrl("en", path)
const m = getMessages("en")
const country = (code: string | undefined) => (code ? ORIGINS.find((o) => o.id === code)?.name.en ?? code : "")
const source = (id: string) => DATA.sources[id]?.name.en ?? id
const hours = (h: number) => `${h} h`
const status = (e: { status: Entry["status"] }) => m.status[e.status].toLowerCase()

function intro(): string[] {
  return [
    "# fly.sy",
    "",
    "> How to get into Syria today: every flight, land crossing and entry document, with the source, confidence level and date last checked on every line. Independent and unofficial: not part of any government body, airline or embassy. It sells nothing and takes no commission.",
    "",
    `Facts last reviewed ${DATA.meta.updated}. Arabic is the main language, at ${SITE_URL}; English is at ${en("/")}. Every English page listed here has an Arabic version at the same path without /en.`,
    "",
    "How to read it:",
    "- Status: operating, conditional (operating with conditions), closed, or unknown.",
    "- Confidence, on every flight and route:",
    `  - verified: ${m.about.lv.verified}`,
    `  - reported: ${m.about.lv.reported}`,
    `  - unconfirmed: ${m.about.lv.unconfirmed}`,
    "- Times are door-to-door estimates in hours: the flight or drive to the entry point, plus fly.sy's own road estimate to the city.",
    "- Where there is no dependable source the site says so instead of guessing. Confirm with the airline or embassy before booking.",
  ]
}

const entryLine = ([id, e]: [string, Entry]) =>
  `- [${e.name.en}](${en(entryPath(id))})${e.country ? `, from ${country(e.country)}` : ""}: ${status(e)}, checked ${e.seen}.${e.syriansOnly ? ` ${m.blockedWhy}` : ""}`

/** The short index: what the site is and where everything lives. */
export function llmsIndex(): string {
  const damascus = DESTINATIONS.find((d) => d.id === "damascus")!
  const others = DESTINATIONS.filter((d) => d.id !== damascus.id).map((d) => d.id)
  return [
    ...intro(),
    "",
    "## Plan a journey",
    "",
    "Each page ranks every known route from one country to one Syrian city by door-to-door time, with what each passport needs.",
    "",
    ...ORIGINS.map((o) => `- [${o.name.en} to Damascus](${en(routePath(o.id, "damascus"))})`),
    "",
    `Other cities: replace "damascus" in any of these addresses with ${others.join(", ")}.`,
    "",
    "## Airports",
    "",
    ...airEntries().map(entryLine),
    "",
    "## Land crossings",
    "",
    ...landEntries().map(entryLine),
    "",
    "## Airlines",
    "",
    ...Object.entries(DATA.airlines).map(([code, a]) => {
      const hops = arrivalsBy(code)
      const where = hops.length ? hops.map((h) => `${h.city.en} to ${DATA.entries[h.entry].name.en}`).join("; ") : "no known route"
      return `- [${a.name.en}](${en(airlinePath(code))}): ${where}`
    }),
    "",
    "## Papers, experiences and method",
    "",
    `- [${m.documents.title}](${en("/documents")}): by air and by land, for Syrian passports, visa on arrival and prior approval`,
    `- [${m.reports.title}](${en("/reports")}): moderated reports from people who made the crossing`,
    `- [${m.about.title}](${en("/about")}): sources, confidence levels, how facts are checked, and common questions`,
    "",
    "## Data",
    "",
    `- [Everything on this site as plain text](${SITE_URL}/llms-full.txt)`,
    ...DATA_FILES.map((f) => `- [${f.id}.json](${dataFileUrl(f.id)}): ${f.name.en}`),
    "",
    "## Optional",
    "",
    `- Contact: ${DATA.meta.contact}`,
    "",
  ].join("\n")
}

const arrivalLine = (a: Arrival) => {
  const who = a.airline ? DATA.airlines[a.airline]?.name.en ?? a.airline : "overland"
  const note = a.note ? ` ${a.note.en}` : ""
  return `- From ${a.city.en} (${country(a.country)}), ${who}: about ${hours(a.hours)}; ${status(a)}; ${a.confidence} (${source(a.source)}, checked ${a.seen}).${note}`
}

function entryBlock([id, e]: [string, Entry]): string[] {
  const via = arrivalsVia(id)
  const roads = Object.entries(DATA.roads[id] ?? {}).sort((a, b) => a[1] - b[1])
  const cityName = (c: string) => DATA.cities.find((x) => x.id === c)?.name.en ?? c
  return [
    `### ${e.name.en}${e.kind === "air" ? ` (IATA ${id})` : e.country ? `, from ${country(e.country)}` : ""}: ${status(e)}`,
    "",
    `Checked ${e.seen} against ${source(e.source)}. Page: ${en(entryPath(id))}`,
    ...(e.note ? ["", e.note.en] : []),
    ...(e.syriansOnly ? ["", m.blockedWhy] : []),
    "",
    via.length ? (e.kind === "air" ? "Flights landing here:" : "Routes through here:") : m.entry.viaEmpty,
    ...via.map(arrivalLine),
    ...(roads.length ? ["", `Road times from here (fly.sy estimates): ${roads.map(([c, h]) => `${cityName(c)} ${hours(h)}`).join(", ")}.`] : []),
    "",
  ]
}

/** Every fact on the site, with its source and check date, in one file. */
export function llmsFull(): string {
  const needs = (["air", "land"] as const).flatMap((mode) => [
    `### ${m.documents[mode]}`,
    "",
    ...PASSPORTS.flatMap((p) => [
      `#### With ${p.name.en}`,
      "",
      ...DATA.needs[mode][p.id].map((n) => `- ${n.text.en} (source: ${source(n.source)})`),
      "",
    ]),
  ])
  return [
    ...intro(),
    "",
    "## Airports",
    "",
    ...airEntries().flatMap(entryBlock),
    "## Land crossings",
    "",
    ...landEntries().flatMap(entryBlock),
    "## Documents you need",
    "",
    m.documents.warn,
    "",
    ...needs,
    "## Sources",
    "",
    ...Object.values(DATA.sources).map((s) => {
      const url = s.url ? ` ${s.url.startsWith("/") ? en(s.url) : s.url}` : ""
      return `- ${s.name.en} (${s.kind.en}): ${s.use.en}${url}`
    }),
    "",
    "## Countries covered as starting points",
    "",
    ORIGINS.map((o) => o.name.en).join(", ") + ".",
    "",
  ].join("\n")
}
