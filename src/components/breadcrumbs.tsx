import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { localePath } from "@/lib/site"
import type { Locale } from "@/lib/types"

export type Crumb = { name: string; path: string }

/** Visible trail matching the BreadcrumbList JSON-LD; the last item is the current page. Sits centred above a panel's headline. */
export function Breadcrumbs({ locale, items }: { locale: Locale; items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
        {items.map((it, i) => {
          const last = i === items.length - 1
          return (
            <li key={it.path} className="flex items-center gap-x-1.5">
              {i > 0 && <ChevronRight className="size-3.5 opacity-60 rtl:rotate-180" aria-hidden="true" />}
              {last ? (
                <span aria-current="page" className="text-foreground">
                  {it.name}
                </span>
              ) : (
                <Link href={localePath(locale, it.path)} className="transition-colors duration-200 hover:text-foreground">
                  {it.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
