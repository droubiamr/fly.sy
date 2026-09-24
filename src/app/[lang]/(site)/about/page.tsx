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
import { Breadcrumbs } from "@/components/breadcrumbs"
import { JsonLd } from "@/components/json-ld"
import { SourceLink } from "@/components/source-link"

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
  return (
    <div className="flex flex-col gap-7">
      <JsonLd
        data={graph(
          organizationLd(locale),
          websiteLd(locale),
          datasetLd(locale),
          breadcrumbLd(locale, crumbs),
          webPageLd(locale, { path: "/about", name: m.about.title, description: m.seo.about.description }),
        )}
      />
      <section>
        <Breadcrumbs locale={locale} items={crumbs} />
        <h1 className="text-2xl font-bold tracking-tight">{m.about.title}</h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">{m.about.lede}</p>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">{m.about.what}</h2>
        <p className="max-w-prose text-[13.5px] leading-relaxed">{m.about.whatText}</p>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">{m.about.levels}</h2>
        <ul className="divide-y rounded-2xl border bg-card px-5">
          {levels.map((k) => (
            <li key={k} className="flex items-start gap-3 py-3">
              <Badge variant="secondary" className="shrink-0">
                {m.confidence[k]}
              </Badge>
              <p className="text-[13.5px] leading-relaxed">{m.about.lv[k]}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">{m.about.how}</h2>
        <p className="max-w-prose text-[13.5px] leading-relaxed">{m.about.howText}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {m.updated} <time dateTime={DATA.meta.updated}>{formatDate(DATA.meta.updated, locale)}</time>
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">{m.about.sources}</h2>
        <ul className="divide-y rounded-2xl border bg-card px-5">
          {Object.entries(DATA.sources).map(([id, s]) => (
            <li key={id} className="flex items-start justify-between gap-3 py-3">
              <div>
                <h3 className="text-sm font-semibold">
                  <SourceLink source={s} locale={locale}>{s.name[locale]}</SourceLink>
                </h3>
                <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">{s.use[locale]}</p>
              </div>
              <span className="shrink-0 pt-0.5 text-[11px] font-semibold text-muted-foreground">{s.kind[locale]}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">{m.about.faq}</h2>
        <dl className="divide-y rounded-2xl border bg-card px-5">
          {m.about.faqs.map((f) => (
            <div key={f.q} className="py-3">
              <dt className="text-sm font-semibold">{f.q}</dt>
              <dd className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs">
          <Link href={localePath(locale, "/documents")} className="text-primary underline-offset-4 hover:underline">
            {m.footer.documents} {arrow(locale)}
          </Link>
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">{m.about.open}</h2>
        <p className="max-w-prose text-[13.5px] leading-relaxed text-muted-foreground">{m.about.openText}</p>
        <p className="mt-2 text-xs">
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-4 hover:underline">
            github.com/droubiamr/fly.sy {arrow(locale)}
          </a>
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">{m.about.contact}</h2>
        <p className="text-[13.5px] leading-relaxed text-muted-foreground">
          {m.about.contactText}{" "}
          {/* dir="ltr" keeps the address in reading order inside an Arabic sentence. */}
          <a
            href={`mailto:${DATA.meta.contact}`}
            dir="ltr"
            className="font-medium text-foreground underline decoration-muted-foreground/40 underline-offset-[3px] hover:decoration-current"
          >
            {DATA.meta.contact}
          </a>
        </p>
        {/* An open door for people who want to build it with us: its own card, so
            the invitation reads as such and not as fine print under the address. */}
        <div className="mt-3 rounded-2xl border bg-card px-5 py-4">
          <p className="text-sm font-semibold">{m.about.join}</p>
          <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">{m.about.joinText}</p>
        </div>
      </section>

      {/* The same words as the first-visit popup, kept here for anyone who
          dismissed it or whose browser dropped the flag. */}
      <section>
        <h2 className="mb-2 text-sm font-semibold">{m.disclaimer.title}</h2>
        <div className="flex flex-col gap-3 rounded-2xl border bg-card px-5 py-4">
          {m.disclaimer.body.map((p) => (
            <p key={p} className="text-[13.5px] leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </section>

      <p className="text-xs leading-relaxed text-muted-foreground">{m.about.fine}</p>
    </div>
  )
}
