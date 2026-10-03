import type { OriginDef, Region } from "./types"

type Partner = {
  name: string
  /** WhatsApp number in international format, digits only: +49 151 0000000 is "491510000000". */
  whatsapp: string
  /** Route pages from countries in these regions (data/origins.json) show the card. */
  regions: Region[]
}

/**
 * The one travel agency fly.sy recommends. It is run by the family of fly.sy's founder, and every place it
 * appears says so: the card on route pages (components/partner-card.tsx), a question on the About page, and
 * llms.txt. It plays no part in the planner: routes are listed and ranked the same with or without it.
 * Until `whatsapp` holds a number it appears nowhere.
 */
export const PARTNER: Partner = {
  name: "Homs Reisen",
  whatsapp: "",
  regions: ["europe"],
}

export const PARTNER_ON = PARTNER.whatsapp !== ""

/** Whether a route page from this country shows the card. */
export const partnerFor = (origin: Pick<OriginDef, "region">) => PARTNER_ON && PARTNER.regions.includes(origin.region)

/** A chat with the agency, the message already typed: in the app on a phone, in WhatsApp Web on a computer. */
export const whatsappHref = (text: string) => `https://wa.me/${PARTNER.whatsapp}?text=${encodeURIComponent(text)}`
