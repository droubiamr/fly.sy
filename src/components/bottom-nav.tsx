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
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 border-t bg-card pb-[env(safe-area-inset-bottom,0px)]"
    >
      <ul className="mx-auto grid max-w-2xl grid-cols-5 px-2 pt-1.5 pb-2">
        {ITEMS.map(({ href, key, Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href)
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-1 rounded-md text-[11px]",
                  // A tab is a control, not content: no text selection on a long
                  // press, and it answers the finger on the way down, not up.
                  "select-none transition-transform duration-100 ease-out active:scale-[0.95]",
                  active ? "font-semibold text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-[22px]" strokeWidth={1.8} aria-hidden="true" />
                {m.tabs[key]}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
