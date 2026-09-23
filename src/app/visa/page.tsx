import Link from "next/link"
import { Plane, Car, ArrowRight } from "lucide-react"
import { DATA, PASSPORTS } from "@/lib/data"
import { getI18n } from "@/lib/i18n"
import { pageMetadata } from "@/lib/metadata"
import type { Passport } from "@/lib/types"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/page-header"
import { Section } from "@/components/section"
import { NeedsList } from "@/components/needs-list"
import { Button } from "@/components/ui/button"

export const generateMetadata = () => pageMetadata((m) => ({ title: m.visa.title, description: m.visa.lede }))

export default async function VisaPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { p } = await searchParams
  const passport: Passport = PASSPORTS.includes(p as Passport) ? (p as Passport) : "sy"
  const { locale, m } = await getI18n()

  const modes = [
    { id: "air", title: m.visa.byAir, Icon: Plane },
    { id: "land", title: m.visa.byLand, Icon: Car },
  ] as const

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={m.visa.title} lede={m.visa.lede}>
        {/* Plain links, not a client toggle: the choice is in the URL so every answer is shareable. */}
        <nav aria-label={m.visa.passport} className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
          {PASSPORTS.map((id) => (
            <Link
              key={id}
              href={id === "sy" ? "/visa" : `/visa?p=${id}`}
              replace
              scroll={false}
              aria-current={id === passport ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center justify-center rounded-lg px-2 text-center text-[13px] leading-tight transition-colors duration-150 ease-out",
                id === passport ? "bg-card font-semibold text-foreground" : "text-muted-foreground",
              )}
            >
              {m.passportShort[id]}
            </Link>
          ))}
        </nav>
      </PageHeader>

      {modes.map(({ id, title, Icon }) => (
        <Section key={id} id={`needs-${id}`} title={<span className="inline-flex items-center gap-2"><Icon className="size-4 text-muted-foreground" aria-hidden="true" />{title}</span>}>
          <div className="rounded-2xl border bg-card px-5 py-4">
            <NeedsList needs={DATA.needs[id][passport]} locale={locale} m={m} />
          </div>
        </Section>
      ))}

      <Section id="gaps" title={m.visa.gaps}>
        <p className="max-w-prose text-[13.5px] leading-relaxed text-muted-foreground">{m.visa.gapsText}</p>
      </Section>

      <Button asChild variant="secondary" className="h-11 self-start rounded-full px-5 shadow-none">
        <Link href={`/?p=${passport}`}>
          {m.visa.seeRoutes}
          <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  )
}
