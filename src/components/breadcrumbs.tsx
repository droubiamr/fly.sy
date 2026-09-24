import Link from "next/link"
import { localePath } from "@/lib/site"
import type { Locale } from "@/lib/types"

export type Crumb = { name: string; path: string }

/** Visible trail matching the BreadcrumbList JSON-LD; the last item is the current page. */
export function Breadcrumbs({ locale, items }: { locale: Locale; items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3 text-xs text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((it, i) => {
          const last = i === items.length - 1
          return (
            <li key={it.path} className="flex items-center gap-x-1.5">
              {i > 0 && <span aria-hidden="true">/</span>}
              {last ? (
                <span aria-current="page">{it.name}</span>
              ) : (
                <Link href={localePath(locale, it.path)} className="underline-offset-4 hover:underline">
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
