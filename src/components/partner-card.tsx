import { MessageCircle } from "lucide-react"
import { cityById } from "@/lib/data"
import { fmt, getI18n } from "@/lib/i18n"
import { PARTNER, partnerFor, whatsappHref } from "@/lib/partner"
import type { Locale, OriginDef } from "@/lib/types"
import { Button } from "@/components/ui/button"

/**
 * The partner agency on a route page: who they are, a WhatsApp chat with the trip already typed in, and
 * whose family runs them. Marked "Partner" so it never reads as a service of fly.sy's own, and placed after
 * the papers, since the site's advice is to settle those before buying a ticket. Shown only on route pages
 * from the countries the agency serves (PARTNER.regions), and only where a route runs.
 */
export function PartnerCard({ locale, origin, dest, running }: { locale: Locale; origin: OriginDef; dest: string; running: boolean }) {
  if (!running || !partnerFor(origin)) return null
  const { m } = getI18n(locale)
  const name = PARTNER.name
  const message = fmt(m.partner.message, { origin: origin.name[locale], city: cityById(dest)!.name[locale] })
  return (
    <section aria-labelledby="partner-h partner-tag" className="overflow-hidden rounded-[10px] border bg-card">
      <div className="flex items-center justify-between gap-3 bg-secondary px-4 py-2.5 text-secondary-foreground">
        <h2 id="partner-h" className="text-[15px] font-bold">
          {m.partner.title}
        </h2>
        <span id="partner-tag" className="shrink-0 rounded-md border-[1.5px] border-current px-2 py-0.5 text-[11px] font-bold tracking-wide">
          {m.partner.tag}
        </span>
      </div>
      <div className="flex flex-col gap-3 p-4">
        <p className="text-[14px] leading-relaxed">{fmt(m.partner.text, { name })}</p>
        {/* Wraps rather than run past a narrow phone's edge if a longer name or translation comes along. */}
        <Button asChild className="h-auto min-h-12 w-full py-2 text-[15px] whitespace-normal">
          {/* sponsored: how search engines ask a partner's link to be marked. */}
          <a href={whatsappHref(message)} target="_blank" rel="sponsored noopener noreferrer">
            <MessageCircle className="size-5" aria-hidden="true" />
            {fmt(m.partner.cta, { name })}
          </a>
        </Button>
        <p className="text-xs leading-relaxed text-muted-foreground">{fmt(m.partner.fine, { name })}</p>
      </div>
    </section>
  )
}
