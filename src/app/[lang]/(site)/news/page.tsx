import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { MessageCircle, Ticket } from "lucide-react"
import { DATA, airlinePath, entryPath } from "@/lib/data"
import { getI18n, requireLocale } from "@/lib/i18n"
import { formatDate } from "@/lib/format"
import { pageMetadata } from "@/lib/seo"
import { breadcrumbLd, graph, webPageLd } from "@/lib/schema"
import { localePath } from "@/lib/site"
import { fmt } from "@/lib/text"
import type { Locale } from "@/lib/types"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { JsonLd } from "@/components/json-ld"
import { SourceLink } from "@/components/source-link"
import { Button } from "@/components/ui/button"

type Props = { params: Promise<{ lang: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  requireLocale(lang)
  const { m } = getI18n(lang)
  return pageMetadata({ locale: lang, path: "/news", title: m.seo.news.title, description: m.seo.news.description })
}

export default async function NewsPage({ params }: Props) {
  const { lang } = await params
  requireLocale(lang)
  const { locale, m } = getI18n(lang)
  const href = (x: string) => localePath(locale, x)
  const crumbs = [
    { name: m.home, path: "/" },
    { name: m.tabs.news, path: "/news" },
  ]
  return (
    <div>
      <JsonLd data={graph(breadcrumbLd(locale, crumbs), webPageLd(locale, { path: "/news", name: m.news.title, description: m.seo.news.description }))} />
      <Breadcrumbs locale={locale} items={crumbs} />
      <h1 className="text-2xl font-bold tracking-tight">{m.news.title}</h1>
      <p className="mt-2 mb-4 max-w-prose text-sm leading-relaxed text-muted-foreground">{m.news.lede}</p>
      {DATA.news.length === 0 && <p className="text-sm text-muted-foreground">{m.news.empty}</p>}
      <ul className="flex flex-col gap-2.5">
        {DATA.news.map((n, index) => {
          const src = DATA.sources[n.source]
          // The item links to the exact post or document; the source's home is the fallback.
          const cited = { ...src, url: n.url ?? src.url }
          const related = [
            ...(n.entries ?? []).map((id) => ({ key: id, path: entryPath(id), name: DATA.entries[id].name[locale] })),
            ...(n.airlines ?? []).map((code) => ({ key: code, path: airlinePath(code), name: DATA.airlines[code].name[locale] })),
          ]
          const office = n.book?.office
          return (
            <li key={n.id} id={n.id} className="overflow-hidden rounded-2xl border bg-card">
              {n.image && (
                // A 16:9 banner on every card; a picture of another shape shows whole inside it, on the muted ground.
                // `unoptimized`: the files are already sized and compressed, and the Cloudflare build has no image service.
                <Image
                  src={n.image.src}
                  alt={n.image.alt[locale]}
                  width={n.image.width}
                  height={n.image.height}
                  unoptimized
                  loading={index === 0 ? "eager" : "lazy"}
                  className="aspect-video w-full border-b bg-muted object-contain"
                />
              )}
              <div className="px-5 py-4">
                <p className="text-xs text-muted-foreground">
                  <time dateTime={n.date}>{formatDate(n.date, locale)}</time>
                </p>
                <h2 className="mt-1 font-semibold leading-snug">{n.title[locale]}</h2>
                <p className="mt-2 text-[13.5px] leading-relaxed">{n.text[locale]}</p>
                {n.book && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                      {n.book.online && (
                        <Button asChild className="h-11 px-4">
                          <a href={n.book.online} target="_blank" rel="noopener noreferrer">
                            <Ticket aria-hidden="true" />
                            {m.news.book.online}
                          </a>
                        </Button>
                      )}
                      {office && (
                        <Button asChild variant="outline" className="h-11 px-4">
                          <a href={whatsapp(office.whatsapp, fmt(m.news.book.message, { title: n.title[locale] }))} target="_blank" rel="noopener noreferrer">
                            <MessageCircle aria-hidden="true" />
                            {fmt(m.news.book.office, { name: office.name[locale] })}
                          </a>
                        </Button>
                      )}
                    </div>
                    {office && <p className="mt-1.5 text-xs text-muted-foreground">{fmt(m.news.book.note, { name: office.name[locale] })}</p>}
                  </div>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  {m.source}:{" "}
                  <SourceLink source={cited} locale={locale}>
                    {src.name[locale]}
                  </SourceLink>
                </p>
                {related.length > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {m.news.related}:{" "}
                    {related.map((r, i) => (
                      <span key={r.key}>
                        <Link href={href(r.path)} className="underline-offset-4 hover:underline">
                          {r.name}
                        </Link>
                        {i < related.length - 1 && " · "}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** A WhatsApp chat with the number, its first line already typed. */
function whatsapp(number: string, text: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}
