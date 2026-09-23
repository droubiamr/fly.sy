import Link from "next/link"
import { getI18n } from "@/lib/i18n"
import { DATA } from "@/lib/data"
import { formatDate } from "@/lib/format"
import { REPO_URL } from "@/lib/site"

/** The small print, once, at the bottom of every page: who we are not, where the
 *  code lives, and when the data was last reviewed. Padded so the mobile dock
 *  never covers the last line. */
export async function SiteFooter() {
  const { locale, m } = await getI18n()
  const link = "underline-offset-4 hover:underline"
  return (
    <footer className="mt-8 border-t px-5 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] text-[13px] leading-relaxed text-muted-foreground md:pb-8">
      <p className="max-w-prose">{m.indep}</p>
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        <span>
          {m.updated} {formatDate(DATA.meta.updated, locale)}
        </span>
        <Link href="/about" className={link}>
          {m.nav.about}
        </Link>
        <a href={REPO_URL} className={link} rel="noopener">
          {m.footer.code}
        </a>
        <a href={DATA.meta.reportContact} className={link} rel="noopener">
          {m.footer.contact}
        </a>
      </p>
      <p className="mt-1 text-xs">{m.footer.licence}</p>
    </footer>
  )
}
