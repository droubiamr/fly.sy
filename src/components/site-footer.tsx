import Link from "next/link"
import type { ReactNode } from "react"
import { DATA } from "@/lib/data"
import { formatDate } from "@/lib/format"
import { getI18n } from "@/lib/i18n"
import { localePath } from "@/lib/site"
import { GITHUB_URL } from "@/lib/schema"
import type { Locale } from "@/lib/types"
import { Logo } from "@/components/logo"

/** Every footer link fades to the text colour over 200ms. Colour only: nothing moves. */
const LINK = "transition-colors duration-200 ease-out hover:text-foreground"

/**
 * Linkat's footer layout: brand and tagline, then link columns, then a thin
 * bar. Two columns on phones, four from the iPad tier up, on the md boundary
 * the stepped layout asks for. Every section is linked here so no page is
 * more than one click from any other, which is also what crawlers follow.
 */
export function SiteFooter({ locale }: { locale: Locale }) {
  const { m } = getI18n(locale)
  const href = (p: string) => localePath(locale, p)
  return (
    <footer className="mt-20 border-t pt-12 pb-32 xl:pb-12">
      <div className="container-app text-sm text-muted-foreground">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
          <div className="col-span-2 md:col-span-1">
            <Link href={href("/")} dir="ltr" className="inline-flex items-center gap-2 font-semibold text-foreground transition-opacity duration-200 ease-out hover:opacity-70">
              <Logo className="size-5" />
              fly.sy
            </Link>
            <p className="mt-3 max-w-[280px] text-[13px] leading-relaxed">{m.indep}</p>
          </div>

          <Column heading={m.footer.explore}>
            <Item href={href("/")}>{m.tabs.plan}</Item>
            <Item href={href("/airlines")}>{m.tabs.airlines}</Item>
            <Item href={href("/crossings")}>{m.tabs.crossings}</Item>
            <Item href={href("/documents")}>{m.footer.documents}</Item>
            <Item href={href("/reports")}>{m.tabs.reports}</Item>
            <Item href={href("/about")}>{m.tabs.about}</Item>
          </Column>

          <Column heading={m.footer.open}>
            <li>
              <a href={GITHUB_URL} rel="noopener" className={LINK}>
                {m.footer.code}
              </a>
            </li>
            <li>
              <a href={`${GITHUB_URL}/blob/main/data/LICENSE`} rel="noopener license" className={LINK}>
                {m.footer.data}
              </a>
            </li>
          </Column>

          <Column heading={m.footer.contact} className="md:justify-self-end">
            <li>
              {/* dir="ltr" keeps the address readable inside the Arabic footer. */}
              <a href={`mailto:${DATA.meta.contact}`} dir="ltr" className={LINK}>
                {DATA.meta.contact}
              </a>
            </li>
          </Column>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t pt-6 text-[13px]">
          <span>{m.footer.disclaimer}</span>
          <span className="text-muted-foreground/70">
            {m.updated} <time dateTime={DATA.meta.updated}>{formatDate(DATA.meta.updated, locale)}</time>
          </span>
        </div>
      </div>
    </footer>
  )
}

function Column({ heading, children, className }: { heading: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <h2 className="mb-3 text-[13px] font-semibold text-foreground">{heading}</h2>
      <ul className="space-y-2">{children}</ul>
    </div>
  )
}

function Item({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <Link href={href} className={LINK}>
        {children}
      </Link>
    </li>
  )
}
