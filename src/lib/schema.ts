import { DATA } from "./data"
import { absoluteUrl, LANG_TAG, SITE_NAME, SITE_URL } from "./site"
import type { Entry, Locale, Text } from "./types"

/* JSON-LD builders. Only what the page really shows, never invented values: an
   empty optional field is left out rather than filled with a placeholder. */

const t = (x: Text, l: Locale) => x[l] ?? x.ar

export const ORG_ID = `${SITE_URL}/#organization`
export const WEBSITE_ID = `${SITE_URL}/#website`

export function organizationLd(locale: Locale) {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png`, width: 512, height: 512 },
    description:
      locale === "ar"
        ? "موقع مستقل غير رسمي يجيب عن سؤال واحد: كيف أصل إلى سوريا اليوم؟"
        : "An independent, unofficial site answering one question: how do I get into Syria today?",
  }
}

export function websiteLd(locale: Locale) {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    alternateName: locale === "ar" ? "كيف تصل إلى سوريا" : "How to get to Syria",
    url: SITE_URL,
    inLanguage: ["ar", "en"],
    publisher: { "@id": ORG_ID },
  }
}

export function breadcrumbLd(locale: Locale, items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(locale, it.path),
    })),
  }
}

export function webPageLd(locale: Locale, { path, name, description }: { path: string; name: string; description: string }) {
  return {
    "@type": "WebPage",
    "@id": `${absoluteUrl(locale, path)}#webpage`,
    url: absoluteUrl(locale, path),
    name,
    description,
    inLanguage: LANG_TAG[locale],
    isPartOf: { "@id": WEBSITE_ID },
    dateModified: DATA.meta.updated,
    publisher: { "@id": ORG_ID },
  }
}

/** Airports as schema.org Airport, land crossings as a Place with coordinates. */
export function entryLd(locale: Locale, id: string, e: Entry, path: string) {
  const base = {
    name: t(e.name, locale),
    url: absoluteUrl(locale, path),
    geo: { "@type": "GeoCoordinates", latitude: e.lat, longitude: e.lng },
    address: { "@type": "PostalAddress", addressCountry: "SY" },
    ...(e.note ? { description: t(e.note, locale) } : {}),
  }
  return e.kind === "air"
    ? { "@type": "Airport", "@id": `${absoluteUrl(locale, path)}#airport`, iataCode: id, ...base }
    : { "@type": "Place", "@id": `${absoluteUrl(locale, path)}#place`, ...base }
}

export function airlineLd(locale: Locale, code: string, path: string) {
  const a = DATA.airlines[code]
  return {
    "@type": "Airline",
    "@id": `${absoluteUrl(locale, path)}#airline`,
    name: t(a.name, locale),
    iataCode: code,
    url: absoluteUrl(locale, path),
    address: { "@type": "PostalAddress", addressCountry: a.country },
  }
}

/** The data/ folder is a real dataset; Google Dataset Search can list it. */
export function datasetLd(locale: Locale) {
  return {
    "@type": "Dataset",
    "@id": `${SITE_URL}/#dataset`,
    name: locale === "ar" ? "بيانات fly.sy: طرق الدخول إلى سوريا" : "fly.sy data: ways into Syria",
    description:
      locale === "ar"
        ? "المطارات والمعابر البرية والرحلات الجوية والأوراق المطلوبة لدخول سوريا، مع المصدر ومستوى الثقة وتاريخ المراجعة لكل سجل. تُحدَّث يدوياً."
        : "Airports, land crossings, flight routes and entry documents for Syria, with a source, confidence level and check date on every record. Updated by hand.",
    url: `${SITE_URL}${locale === "ar" ? "" : "/en"}/about`,
    isAccessibleForFree: true,
    creator: { "@id": ORG_ID },
    dateModified: DATA.meta.updated,
    inLanguage: ["ar", "en"],
    spatialCoverage: { "@type": "Place", name: "Syria", address: { "@type": "PostalAddress", addressCountry: "SY" } },
    keywords: ["Syria", "travel", "border crossings", "airports", "flights", "visa", "سوريا", "معابر", "مطارات"],
  }
}

/** Wrap one or more nodes in a single @graph document. */
export const graph = (...nodes: object[]) => ({ "@context": "https://schema.org", "@graph": nodes })
