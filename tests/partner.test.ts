import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { PARTNER, partnerFor, whatsappHref } from "../src/lib/partner.ts"
import { getMessages } from "../src/messages/index.ts"
import type { Region } from "../src/lib/types.ts"

const origins = JSON.parse(readFileSync(new URL("../data/origins.json", import.meta.url), "utf8")) as { id: string; region: Region }[]

test("partner: the WhatsApp number is empty (partner off) or international digits only", () => {
  // wa.me takes the number without "+", "00" or spaces; E.164 numbers are at most 15 digits and never start with 0.
  if (PARTNER.whatsapp === "") return
  assert.match(PARTNER.whatsapp, /^[1-9]\d{7,14}$/, `whatsapp "${PARTNER.whatsapp}": digits only, country code first, no leading 0`)
})

test("partner: its regions are real and at least one country is in them", () => {
  assert.ok(PARTNER.name.trim(), "name")
  assert.ok(PARTNER.regions.length > 0, "no regions: the card would show nowhere")
  const known = new Set(origins.map((o) => o.region))
  for (const r of PARTNER.regions) assert.ok(known.has(r), `region ${r} is in no origin`)
})

test("partner: shown only for its regions, and only when it has a number", () => {
  const inside = origins.find((o) => PARTNER.regions.includes(o.region))!
  const outside = origins.find((o) => !PARTNER.regions.includes(o.region))
  assert.equal(partnerFor(inside), PARTNER.whatsapp !== "")
  if (outside) assert.equal(partnerFor(outside), false)
})

test("partner: the chat link carries the typed message intact, Arabic included", () => {
  const text = "مرحباً، أريد السفر من ألمانيا إلى دمشق. Hello & bye?"
  const url = new URL(whatsappHref(text))
  assert.equal(url.origin, "https://wa.me")
  assert.equal(url.pathname, `/${PARTNER.whatsapp}`)
  assert.equal(url.searchParams.get("text"), text)
})

test("partner: every place it appears says whose it is, in both languages", () => {
  for (const locale of ["ar", "en"] as const) {
    const p = getMessages(locale).partner
    for (const k of ["tag", "title", "text", "cta", "fine", "message"] as const) assert.ok(p[k].trim(), `${locale} partner.${k}`)
    // The disclosure under the button and the About page answer both name the agency and fly.sy.
    for (const t of [p.fine, p.faq.a]) {
      assert.ok(t.includes("{name}") && t.includes("fly.sy"), `${locale}: the disclosure must name the agency and fly.sy: ${t}`)
    }
  }
})

test("partner: the planner never reads it, so routes rank the same with or without it", () => {
  // The card and the About page promise this; keep it true.
  assert.doesNotMatch(readFileSync(new URL("../src/lib/plan.ts", import.meta.url), "utf8"), /partner/i)
})
