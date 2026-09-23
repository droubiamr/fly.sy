import type { LucideIcon } from "lucide-react"
import type { Row } from "@/lib/admin-data"

const nf = new Intl.NumberFormat("en-GB")
const pct = new Intl.NumberFormat("en-GB", { style: "percent", maximumFractionDigits: 0 })
const SHOWN = 8

type Item = { key: string; label: string; href?: string; views: number; visitors: number }

/**
 * A ranked list with a thin meter under each row: the fill is the row's share of all views, on a track one
 * step lighter from the same green, so the length reads without the number.
 */
export function TopList({
  title,
  Icon,
  rows,
  total,
  label = (k) => k,
  href,
  empty = "Nothing yet.",
}: {
  title: string
  Icon: LucideIcon
  rows: Row[]
  total: number
  label?: (key: string) => string
  href?: (key: string) => string | undefined
  empty?: string
}) {
  const items: Item[] = rows.map((r) => ({ ...r, label: label(r.key), href: href?.(r.key) }))
  const head = items.slice(0, SHOWN)
  const rest = items.slice(SHOWN)
  const headingId = `top-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`

  return (
    <section className="flex min-w-0 flex-col rounded-xl border bg-card p-4" aria-labelledby={headingId}>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
        <h2 id={headingId} className="text-sm font-semibold">
          {title}
        </h2>
        <span className="ms-auto text-xs text-muted-foreground">Views</span>
      </div>
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>
      ) : (
        <>
          <ol className="flex flex-col gap-2.5">
            {head.map((it) => (
              <Line key={it.key} item={it} total={total} />
            ))}
          </ol>
          {rest.length > 0 && (
            <details className="mt-1">
              <summary className="inline-flex h-11 cursor-pointer items-center text-xs text-muted-foreground hover:text-foreground">
                {rest.length} more
              </summary>
              <ol className="flex flex-col gap-2.5">
                {rest.map((it) => (
                  <Line key={it.key} item={it} total={total} />
                ))}
              </ol>
            </details>
          )}
        </>
      )}
    </section>
  )
}

function Line({ item, total }: { item: Item; total: number }) {
  const share = total > 0 ? item.views / total : 0
  return (
    <li className="flex flex-col gap-1">
      <div className="flex items-baseline gap-3 text-sm">
        {item.href ? (
          <a href={item.href} target="_blank" rel="noreferrer" className="min-w-0 truncate hover:underline" title={item.label}>
            {item.label}
          </a>
        ) : (
          <span className="min-w-0 truncate" title={item.label}>
            {item.label}
          </span>
        )}
        <span className="ms-auto shrink-0 font-medium tabular-nums">{nf.format(item.views)}</span>
        <span className="w-10 shrink-0 text-end text-xs text-muted-foreground tabular-nums">{pct.format(share)}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(share * 100, 1)}%` }} />
      </div>
    </li>
  )
}
