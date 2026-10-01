import { DATA, ORIGINS } from "./data"
import { SITE_URL, absoluteUrl } from "./site"
import type { Text } from "./types"

/**
 * The data/ files, published as JSON at /data/{id}.json so assistants and
 * dataset search can read the facts themselves instead of scraping pages.
 * Listed in the Dataset structured data. No licence is claimed here: the site
 * stopped stating one on 24 Sep 2026, and that is the owner's call to reopen.
 */
export const DATA_FILES = [
  { id: "entries", name: { en: "Airports and land crossings into Syria", ar: "المطارات والمعابر البرية إلى سوريا" } },
  { id: "arrivals", name: { en: "Flights and overland routes into Syria", ar: "الرحلات الجوية والطرق البرية إلى سوريا" } },
  { id: "airlines", name: { en: "Airlines flying to Syria", ar: "شركات الطيران إلى سوريا" } },
  { id: "needs", name: { en: "Documents needed to enter Syria, by route and passport", ar: "الأوراق المطلوبة لدخول سوريا حسب الطريق والجواز" } },
  { id: "roads", name: { en: "Estimated road hours from each entry point to each city", ar: "أزمنة الطريق التقديرية من كل منفذ إلى كل مدينة" } },
  { id: "origins", name: { en: "Countries you can start from", ar: "الدول التي يمكن الانطلاق منها" } },
  { id: "cities", name: { en: "Syrian cities", ar: "المدن السورية" } },
  { id: "sources", name: { en: "Sources", ar: "المصادر" } },
] as const satisfies readonly { id: string; name: Text }[]

export type DataFileId = (typeof DATA_FILES)[number]["id"]

export const dataFileUrl = (id: DataFileId) => `${SITE_URL}/data/${id}.json`
export const isDataFile = (id: string): id is DataFileId => DATA_FILES.some((f) => f.id === id)

/** One published file: the records as the site uses them, wrapped with what they are and how to read them. */
export function dataFile(id: DataFileId) {
  const records = {
    entries: DATA.entries,
    // Hidden rows are kept in the repo as a record but never shown on the site, so they are not published either.
    arrivals: DATA.arrivals.filter((a) => !a.hidden),
    airlines: DATA.airlines,
    needs: DATA.needs,
    roads: DATA.roads,
    origins: ORIGINS,
    cities: DATA.cities,
    sources: DATA.sources,
  }[id]
  return {
    name: DATA_FILES.find((f) => f.id === id)!.name.en,
    publisher: "fly.sy",
    url: absoluteUrl("en", "/about"),
    updated: DATA.meta.updated,
    howToRead:
      "Facts name a source id from sources.json. Entries and arrivals also carry status (open, caution, closed, unknown), " +
      "confidence (verified, reported, unconfirmed) and seen, the date the line was last checked. Hours are estimates; " +
      "road hours are fly.sy's own. Confirm with the airline or embassy before travelling.",
    data: records,
  }
}
