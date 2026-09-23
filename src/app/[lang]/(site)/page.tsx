import type { Metadata } from "next"
import { originById } from "@/lib/data"
import { getI18n, requireLocale } from "@/lib/i18n"
import { pageMetadata } from "@/lib/seo"
import { datasetLd, graph, organizationLd, webPageLd, websiteLd } from "@/lib/schema"
import type { Locale } from "@/lib/types"
import { JsonLd } from "@/components/json-ld"
import { PlanView } from "@/components/plan-view"

type Props = { params: Promise<{ lang: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  requireLocale(lang)
  const { m } = getI18n(lang)
  return pageMetadata({
    locale: lang,
    path: "/",
    title: { absolute: `fly.sy — ${m.seo.home.title}` },
    description: m.seo.home.description,
  })
}

export default async function HomePage({ params }: Props) {
  const { lang } = await params
  requireLocale(lang)
  const { m } = getI18n(lang)
  // Türkiye by default: it hosts the most Syrians abroad. Every other answer is its own page.
  const origin = originById("TR")!
  return (
    <>
      <JsonLd
        data={graph(
          organizationLd(lang),
          websiteLd(lang),
          datasetLd(lang),
          webPageLd(lang, { path: "/", name: m.seo.home.title, description: m.seo.home.description }),
        )}
      />
      {/* Like Linkat's hero: the headline and the one input, nothing else. */}
      <PlanView locale={lang} origin={origin} dest="damascus" title={m.homeTitle} size="home" />
    </>
  )
}
