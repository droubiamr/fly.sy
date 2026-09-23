import type { Metadata } from "next"
import Link from "next/link"
import { DATA } from "@/lib/data"
import { getI18n, requireLocale } from "@/lib/i18n"
import { arrow, formatDate } from "@/lib/format"
import { pageMetadata } from "@/lib/seo"
import { GITHUB_URL, breadcrumbLd, datasetLd, graph, organizationLd, webPageLd, websiteLd } from "@/lib/schema"
import { localePath } from "@/lib/site"
import type { Locale } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { JsonLd } from "@/components/json-ld"
import { PageBody, PageHero, SURFACE, Section } from "@/components/page"
import { SourceLink } from "@/components/source-link"
import { cn } from "@/lib/utils"

type Props = { params: Promise<{ lang: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  requireLocale(lang)
  const { m } = getI18n(lang)
  return pageMetadata({ locale: lang, path: "/about", title: m.seo.about.title, description: m.seo.about.description })
}

export default async function AboutPage({ params }: Props) {
  const { lang } = await params
  requireLocale(lang)
  const { locale, m } = getI18n(lang)
  const levels = ["verified", "reported", "unconfirmed"] as const
  const crumbs = [
    { name: m.home, path: "/" },
    { name: m.tabs.about, path: "/about" },
  ]
  const link = "text-sm font-medium underline-offset-4 hover:underline"
  return (
    <>
      <JsonLd
        data={graph(
          organizationLd(locale),
          websiteLd(locale),
          datasetLd(locale),
          breadcrumbLd(locale, crumbs),
          webPageLd(locale, { path: "/about", name: m.about.title, description: m.seo.about.description }),
        )}
      />
      <PageHero locale={locale} crumbs={crumbs} title={m.about.title} lede={m.about.lede} />

      {/* Mostly prose, so Linkat's 680px reading column. */}
      <PageBody narrow>
        <Section id="what-h" title={m.about.what}>
          <p className="text-[15px] leading-relaxed">{m.about.whatText}</p>
        </Section>

        <Section id="lv-h" title={m.about.levels}>
          <ul className={cn(SURFACE, "divide-y px-5")}>
            {levels.map((k) => (
              <li key={k} className="flex items-start gap-3 py-4">
                <Badge variant="secondary" className="mt-0.5 h-6 shrink-0 px-2.5">
                  {m.confidence[k]}
                </Badge>
                <p className="text-[14px] leading-relaxed">{m.about.lv[k]}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          id="how-h"
          title={m.about.how}
          note={
            <>
              {m.updated} <time dateTime={DATA.meta.updated}>{formatDate(DATA.meta.updated, locale)}</time>
            </>
          }
        >
          <p className="text-[15px] leading-relaxed">{m.about.howText}</p>
        </Section>

        <Section id="src-h" title={m.about.sources}>
          <ul className={cn(SURFACE, "divide-y px-5")}>
            {Object.entries(DATA.sources).map(([id, s]) => (
              <li key={id} className="flex items-start justify-between gap-3 py-4">
                <div>
                  <h3 className="text-sm font-semibold">
                    <SourceLink source={s} locale={locale}>{s.name[locale]}</SourceLink>
                  </h3>
                  <p className="mt-0.5 text-[13.5px] leading-relaxed text-muted-foreground">{s.use[locale]}</p>
                </div>
                <Badge variant="outline" className="h-6 shrink-0 px-2.5 text-muted-foreground">
                  {s.kind[locale]}
                </Badge>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="faq-h" title={m.about.faq}>
          <dl className={cn(SURFACE, "divide-y px-5")}>
            {m.about.faqs.map((f) => (
              <div key={f.q} className="py-4">
                <dt className="font-semibold">{f.q}</dt>
                <dd className="mt-1 text-[14px] leading-relaxed text-muted-foreground">{f.a}</dd>
              </div>
            ))}
          </dl>
          <Link href={localePath(locale, "/documents")} className={cn(link, "mt-3 inline-flex")}>
            {m.footer.documents} {arrow(locale)}
          </Link>
        </Section>

        <Section id="open-h" title={m.about.open}>
          <p className="text-[15px] leading-relaxed text-muted-foreground">{m.about.openText}</p>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" dir="ltr" className={cn(link, "mt-3 inline-flex")}>
            github.com/droubiamr/fly.sy
          </a>
        </Section>

        <Section id="contact-h" title={m.about.contact}>
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            {m.about.contactText}{" "}
            {/* dir="ltr" keeps the address in reading order inside an Arabic sentence. */}
            <a href={`mailto:${DATA.meta.contact}`} dir="ltr" className="font-medium text-foreground underline decoration-muted-foreground/40 underline-offset-[3px] hover:decoration-current">
              {DATA.meta.contact}
            </a>
          </p>
          {/* An open door for people who want to build it with us: its own card,
              so the invitation reads as such and not as fine print. */}
          <div className={cn(SURFACE, "mt-4 px-5 py-4")}>
            <p className="font-semibold">{m.about.join}</p>
            <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">{m.about.joinText}</p>
          </div>
        </Section>

        {/* The same words as the first-visit popup, kept here for anyone who
            dismissed it or whose browser dropped the flag. */}
        <Section id="disc-h" title={m.disclaimer.title}>
          <div className={cn(SURFACE, "flex flex-col gap-3 px-5 py-4")}>
            {m.disclaimer.body.map((p) => (
              <p key={p} className="text-[14px] leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </Section>

        <p className="text-xs leading-relaxed text-muted-foreground">{m.about.fine}</p>
      </PageBody>
    </>
  )
}
