import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { DATA, LINK_GROUPS, airlinePath, entryPath, linkUrl } from "@/lib/data"
import { getI18n, requireLocale } from "@/lib/i18n"
import { arrow, formatDate, hostOf, shortUrl } from "@/lib/format"
import { pageMetadata } from "@/lib/seo"
import { breadcrumbLd, graph, linksLd, webPageLd } from "@/lib/schema"
import { localePath } from "@/lib/site"
import type { Locale, Resource, ResourceLink } from "@/lib/types"
import type { Messages } from "@/messages"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { CountryTag } from "@/components/country-tag"
import { JsonLd } from "@/components/json-ld"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Props = { params: Promise<{ lang: Locale }> }
const PATH = "/links"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  requireLocale(lang)
  const { m } = getI18n(lang)
  return pageMetadata({ locale: lang, path: PATH, title: m.seo.links.title, description: m.seo.links.description })
}

/** The cards of each section, in the page's order. */
const sections = () => LINK_GROUPS.map((g) => ({ group: g, cards: DATA.links.filter((r) => r.group === g) })).filter((s) => s.cards.length)

export default async function LinksPage({ params }: Props) {
  const { lang } = await params
  requireLocale(lang)
  const { locale, m } = getI18n(lang)
  const href = (x: string) => localePath(locale, x)
  const crumbs = [
    { name: m.home, path: "/" },
    { name: m.tabs.links, path: PATH },
  ]
  const all = sections()
  // Under each heading, where the rest of the story lives on this site.
  const lede = {
    airlines: { text: m.links.airlinesLede, path: "/airlines", label: m.airlines.title },
    visas: { text: m.links.visasLede, path: "/documents", label: m.footer.documents },
  } as const
  return (
    <div className="flex flex-col gap-7">
      <JsonLd
        data={graph(
          breadcrumbLd(locale, crumbs),
          webPageLd(locale, { path: PATH, name: m.links.title, description: m.seo.links.description }),
          linksLd(locale, PATH, m.links.title, all.flatMap((s) => s.cards)),
        )}
      />
      <section>
        <Breadcrumbs locale={locale} items={crumbs} />
        <h1 className="text-2xl font-bold tracking-tight">{m.links.title}</h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">{m.links.lede}</p>
        <p className="mt-2 max-w-prose text-xs leading-relaxed text-muted-foreground">{m.links.how}</p>
        <nav aria-label={m.links.jump} className="mt-4">
          <ul className="flex flex-wrap gap-2">
            {all.map(({ group }) => (
              <li key={group}>
                <a href={`#${group}`} className="inline-flex min-h-11 items-center rounded-full border bg-card px-4 text-sm">
                  {m.links.groups[group]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      <Alert>
        <AlertDescription>{m.links.warn}</AlertDescription>
      </Alert>

      {all.map(({ group, cards }) => {
        const l = group in lede ? lede[group as keyof typeof lede] : null
        return (
          // scroll-mt clears the sticky header when a section or card is opened by its anchor.
          <section key={group} id={group} aria-labelledby={`${group}-h`} className="scroll-mt-20">
            <h2 id={`${group}-h`} className="text-xl font-bold tracking-tight">
              {m.links.groups[group]}
            </h2>
            {l && (
              <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">
                {l.text}{" "}
                <Link href={href(l.path)} className="font-semibold text-primary underline-offset-4 hover:underline">
                  {l.label} {arrow(locale)}
                </Link>
              </p>
            )}
            <ul className="mt-3 flex flex-col gap-3">
              {cards.map((r) => (
                <Card key={r.id} r={r} locale={locale} m={m} />
              ))}
            </ul>
          </section>
        )
      })}

      <p className="text-[13.5px] leading-relaxed text-muted-foreground">
        {m.links.missing}{" "}
        {/* dir="ltr" keeps the address in reading order inside an Arabic sentence. */}
        <a
          href={`mailto:${DATA.meta.contact}`}
          dir="ltr"
          className="font-medium text-foreground underline decoration-muted-foreground/40 underline-offset-[3px] hover:decoration-current"
        >
          {DATA.meta.contact}
        </a>
      </p>
    </div>
  )
}

/**
 * One body or tool: a board like the route pages', its name on the header band, what it is for, then one row
 * per address with the address itself at the end, so a reader can compare it with the one in their browser.
 */
function Card({ r, locale, m }: { r: Resource; locale: Locale; m: Messages }) {
  const site = r.links.find((l) => l.kind === "site")
  const siteHost = site ? hostOf(linkUrl(site, locale)) : null
  const ours = r.entry
    ? { path: entryPath(r.entry), name: DATA.entries[r.entry].name[locale] }
    : r.airline
      ? { path: airlinePath(r.airline), name: DATA.airlines[r.airline].name[locale] }
      : null
  return (
    <li id={r.id} className="scroll-mt-20 overflow-hidden rounded-[10px] border bg-card">
      {/* No airline logo here: next/image would add its client chunk to a page that otherwise ships none of its own. */}
      <h3 className="flex items-center gap-2 bg-secondary px-4 py-2.5 text-[15px] leading-snug font-bold text-secondary-foreground">
        {r.country && <CountryTag code={r.country} />}
        {r.name[locale]}
      </h3>
      <p className="px-4 py-3 text-[13.5px] leading-relaxed">{r.use[locale]}</p>
      <ul>
        {r.links.map((l, i) => {
          const url = linkUrl(l, locale)
          return (
            <li key={i} className="border-t">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 items-center gap-3 px-4 py-2 text-[14px] transition-colors duration-100 ease-out hover:bg-muted active:bg-muted"
              >
                <span className="shrink-0 font-semibold">{l.label ? l.label[locale] : m.links.kinds[l.kind]}</span>
                <span className="ms-auto min-w-0 truncate text-[13px] text-muted-foreground">
                  <bdi dir="ltr">{shown(l, url, siteHost)}</bdi>
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground rtl:-scale-x-100" aria-hidden="true" />
              </a>
            </li>
          )
        })}
      </ul>
      <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 border-t px-4 py-2.5 text-xs text-muted-foreground">
        <span>
          {m.checked} <time dateTime={r.seen}>{formatDate(r.seen, locale)}</time>
        </span>
        {ours && (
          <>
            <span aria-hidden="true">·</span>
            <Link href={localePath(locale, ours.path)} className="font-semibold text-primary underline-offset-4 hover:underline">
              {ours.name} {m.links.onSite} {arrow(locale)}
            </Link>
          </>
        )}
      </p>
    </li>
  )
}

/**
 * What the end of a row says. An account shows its handle, which is what a look-alike page gets wrong; a site
 * shows its host; a page of the card's own site shows nothing more; an app shows its store.
 */
function shown(l: ResourceLink, url: string, siteHost: string | null) {
  if (l.kind === "ios") return "App Store"
  if (l.kind === "android") return "Google Play"
  if (l.kind === "site" || l.kind === "whatsapp") return hostOf(url)
  if (l.kind === "page") return hostOf(url) === siteHost ? "" : hostOf(url)
  return shortUrl(url)
}
