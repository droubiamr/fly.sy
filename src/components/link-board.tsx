import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export type BoardLink = { key: string; href: string; label: string; lead?: React.ReactNode }

/**
 * A list of pages to go to, as a board of rows like the route pages' flight boards: one row per page, its
 * marker (status dot, logo) at the start and a chevron at the end. Two columns on a wide screen; an odd last
 * row spans both so no empty cell shows.
 */
export function LinkBoard({ items }: { items: BoardLink[] }) {
  return (
    <ul className="grid gap-px overflow-hidden rounded-[10px] border bg-border sm:grid-cols-2">
      {items.map((it, i) => (
        <li key={it.key} className={cn("bg-card", i === items.length - 1 && items.length % 2 === 1 && "sm:col-span-2")}>
          <Link
            href={it.href}
            className="flex min-h-12 items-center gap-3 px-4 py-2 text-[14px] font-medium transition-colors duration-100 ease-out hover:bg-muted active:bg-muted"
          >
            {it.lead}
            <span className="min-w-0 flex-1 truncate">{it.label}</span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  )
}
