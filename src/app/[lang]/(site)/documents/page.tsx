import type { Metadata } from "next"
import Link from "next/link"
import { DATA, airEntries, entryPath, landEntries } from "@/lib/data"
import { getI18n, requireLocale } from "@/lib/i18n"
import { pageMetadata } from "@/lib/seo"
import { breadcrumbLd, graph, webPageLd } from "@/lib/schema"
import { localePath } from "@/lib/site"
import type { Locale, Mode, Passport } from "@/lib/types"
import { JsonLd } from "@/components/json-ld"
import { PageBody, PageHero, SURFACE, Section } from "@/components/page"
import { Provenance } from "@/components/provenance"
import { cn } from "@/lib/utils"
import { TriangleAlert } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Props = { params: Promise<{ lang: Locale }> }
const MODES: Mode[] = ["air", "land"]
const PASSPORTS: Passport[] = ["sy", "voa", "res"]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  requireLocale(lang)
  const { m } = getI18n(lang)
  return pageMetadata({ locale: lang, path: "/documents", title: m.seo.documents.title, description: m.seo.documents.description })
}

export default async function DocumentsPage({ params }: Props) {
  const { lang } = await params
  requireLocale(lang)
  const { locale, m } = getI18n(lang)
  const href = (x: string) => localePath(locale, x)
  const crumbs = [
    { name: m.home, path: "/" },
    { name: m.footer.documents, path: "/documents" },
  ]
  return (
    <>
      <JsonLd data={graph(breadcrumbLd(locale, crumbs), webPageLd(locale, { path: "/documents", name: m.documents.title, description: m.seo.documents.description }))} />
      <PageHero locale={locale} crumbs={crumbs} title={m.documents.title} lede={m.documents.lede} />
      <PageBody>
        <Alert className="rounded-2xl px-4 py-3">
          <TriangleAlert className="text-status-caution" aria-hidden="true" />
          <AlertDescription className="text-foreground">{m.documents.warn}</AlertDescription>
        </Alert>

        {MODES.map((mode) => (
          <Section
            key={mode}
            id={`h-${mode}`}
            title={m.documents[mode]}
            note={(mode === "air" ? airEntries() : landEntries()).map(([id, e], i, arr) => (
              <span key={id}>
                <Link href={href(entryPath(id))} className="underline-offset-4 hover:underline">
                  {e.name[locale]}
                </Link>
                {i < arr.length - 1 && " · "}
              </span>
            ))}
          >
            <div className="grid gap-3 xl:grid-cols-3">
              {PASSPORTS.map((pp) => (
                <div key={pp} className={cn(SURFACE, "px-5 py-4")}>
                  <h3 className="font-semibold">{m.reports.form.passports[pp]}</h3>
                  <ul className="mt-2 flex list-disc flex-col gap-2.5 ps-4 text-[13.5px] leading-relaxed">
                    {DATA.needs[mode][pp].map((n, i) => (
                      <li key={i}>
                        {n.text[locale]}
                        <Provenance source={n.source} locale={locale} m={m} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        ))}

        <p className="text-xs leading-relaxed text-muted-foreground">{m.about.fine}</p>
      </PageBody>
    </>
  )
}
