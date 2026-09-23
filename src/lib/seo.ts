import type { Metadata } from "next"
import type { Locale } from "./types"
import { absoluteUrl, OG_LOCALE, otherLocale, SITE_NAME, SITE_URL } from "./site"
import { getMessages } from "@/messages"

/** The share card, app/opengraph-image.png, served by Next at this path. */
const OG_IMAGE = { url: `${SITE_URL}/opengraph-image.png`, width: 1200, height: 630 }

/**
 * Full metadata for one page in one language: self-canonical, hreflang to the
 * other language and x-default (Arabic, the site's home language), Open Graph
 * and Twitter cards. Nested metadata objects replace rather than merge across
 * layouts, so every page passes through here and gets the whole set, the share
 * card included: a page's openGraph block would otherwise drop the file-based one.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  noindex = false,
}: {
  locale: Locale
  path: string
  title: string | { absolute: string }
  description: string
  noindex?: boolean
}): Metadata {
  const url = absoluteUrl(locale, path)
  const plain = typeof title === "string" ? title : title.absolute
  const image = { ...OG_IMAGE, alt: getMessages(locale).meta.card }
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ar: absoluteUrl("ar", path),
        en: absoluteUrl("en", path),
        "x-default": absoluteUrl("ar", path),
      },
    },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale],
      alternateLocale: [OG_LOCALE[otherLocale(locale)]],
      title: plain,
      description,
      images: [image],
    },
    twitter: { card: "summary_large_image", title: plain, description, images: [image] },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  }
}
