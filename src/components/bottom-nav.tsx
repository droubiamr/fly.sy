"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MapPin, Plane, Landmark, MessagesSquare, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMessages } from "@/components/messages-provider"

const ITEMS = [
  { href: "/", key: "plan", Icon: MapPin },
  { href: "/airlines", key: "airlines", Icon: Plane },
  { href: "/crossings", key: "crossings", Icon: Landmark },
  { href: "/reports", key: "reports", Icon: MessagesSquare },
  { href: "/about", key: "about", Icon: Info },
] as const

export function BottomNav() {
  const path = usePathname()
  const m = useMessages()
  return (
    // A floating dock rather than a bar welded to the bottom edge. The wrapper
    // ignores pointer events so taps either side of the pill reach the page
    // underneath; only the pill itself takes them back.
    <nav
      aria-label="Main"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-20 px-5 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]"
    >
      <ul
        className="pointer-events-auto mx-auto flex max-w-md items-center gap-0.5 rounded-full border border-border/70
                   bg-card/72 p-2 backdrop-blur-lg backdrop-saturate-150"
      >
        {ITEMS.map(({ href, key, Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href)
          return (
            <li key={href} className="min-w-0 flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  // Not rounded-full. A capsule that fills its row and is fully rounded ends
                  // up exactly tangent to the pill's own curve however much padding the
                  // pill has, because the pill's radius grows with it. A hair under half
                  // the height breaks that tie and leaves the two curves visibly apart.
                  "flex min-h-12 flex-col items-center justify-center gap-1 rounded-[22px] px-0.5 text-[10.5px] leading-tight",
                  // A tab is a control, not content: no text selection on a long
                  // press, and it answers the finger on the way down, not up.
                  "select-none transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.94]",
                  // The current page is marked by a filled capsule, which is solid
                  // on purpose: a translucent surface stacked on another one stops
                  // reading as either.
                  active
                    ? "bg-secondary font-semibold text-secondary-foreground"
                    : "text-muted-foreground",
                )}
              >
                <Icon className="size-5 shrink-0" strokeWidth={active ? 2 : 1.8} aria-hidden="true" />
                <span className="w-full truncate text-center">{m.tabs[key]}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
