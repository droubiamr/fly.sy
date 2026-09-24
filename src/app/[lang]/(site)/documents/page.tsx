import type { Metadata } from "next"
import Link from "next/link"
import { DATA, airEntries, entryPath, landEntries } from "@/lib/data"
import { getI18n, requireLocale } from "@/lib/i18n"
import { pageMetadata } from "@/lib/seo"
import { breadcrumbLd, graph, webPageLd } from "@/lib/schema"
import { localePath } from "@/lib/site"
import type { Locale, Mode, Passport } from "@/lib/types"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { JsonLd } from "@/components/json-ld"
import { Provenance } from "@/components/provenance"
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
    <div className="flex flex-col gap-7">
      <JsonLd data={graph(breadcrumbLd(locale, crumbs), webPageLd(locale, { path: "/documents", name: m.documents.title, description: m.seo.documents.description }))} />
      <section>
        <Breadcrumbs locale={locale} items={crumbs} />
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">{m.documents.title}</h1>
        <p className="mt-2 max-w-prose text-[17px] leading-relaxed text-muted-foreground">{m.documents.lede}</p>
      </section>

      <Alert>
        <AlertDescription>{m.documents.warn}</AlertDescription>
      </Alert>

      {MODES.map((mode) => (
        <section key={mode} aria-labelledby={`h-${mode}`}>
          <h2 id={`h-${mode}`} className="text-xl font-bold tracking-tight">
            {m.documents[mode]}
          </h2>
          <p className="mt-1 mb-3 text-[15px] text-muted-foreground">
            {(mode === "air" ? airEntries() : landEntries()).map(([id, e], i, arr) => (
              <span key={id}>
                <Link href={href(entryPath(id))} className="underline-offset-4 hover:underline">
                  {e.name[locale]}
                </Link>
                {i < arr.length - 1 && " · "}
              </span>
            ))}
          </p>
          <div className="flex flex-col gap-3">
            {PASSPORTS.map((pp) => (
              <div key={pp} className="rounded-2xl border-[1.5px] bg-card px-5 py-4">
                <h3 className="text-xl font-bold">{m.reports.form.passports[pp]}</h3>
                <ul className="mt-2 flex list-disc flex-col gap-3 ps-5 text-[17px] leading-relaxed">
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
        </section>
      ))}

      <p className="text-base leading-relaxed text-muted-foreground">{m.about.fine}</p>
    </div>
  )
}
