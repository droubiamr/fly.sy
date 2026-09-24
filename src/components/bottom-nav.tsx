"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MapPin, Plane, Landmark, MessagesSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { localePath, splitLocale } from "@/lib/site"
import { useLocale, useMessages } from "@/components/messages-provider"

// Four tabs, not five: "about" lives in the footer of every page. With five, the
// labels had to drop to 10px, and the label is what an older reader uses.
const ITEMS = [
  { href: "/", key: "plan", Icon: MapPin },
  { href: "/airlines", key: "airlines", Icon: Plane },
  { href: "/crossings", key: "crossings", Icon: Landmark },
  { href: "/reports", key: "reports", Icon: MessagesSquare },
] as const

export function BottomNav() {
  const { path } = splitLocale(usePathname())
  const locale = useLocale()
  const m = useMessages()
  return (
    // A solid bar welded to the bottom edge, with a border. Content never shows
    // through it, and every tab is a 64px-tall target with a word under the icon.
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-20 border-t-[1.5px] bg-card pb-[env(safe-area-inset-bottom,0px)]">
      <ul className="mx-auto flex max-w-2xl items-stretch gap-1 px-2 pt-1.5 pb-1.5">
        {ITEMS.map(({ href, key, Icon }) => {
          const active =
            href === "/"
              ? path === "/" || path.startsWith("/from/")
              : href === "/crossings"
                ? path.startsWith("/crossings") || path.startsWith("/airports") || path === "/documents"
                : path.startsWith(href)
          return (
            <li key={href} className="min-w-0 flex-1">
              <Link
                href={localePath(locale, href)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[14px] font-semibold leading-tight",
                  "select-none transition-[background-color,color] duration-150 ease-out active:bg-muted",
                  active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="size-7 shrink-0" strokeWidth={active ? 2.2 : 1.9} aria-hidden="true" />
                <span className="w-full truncate text-center">{m.tabs[key]}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
