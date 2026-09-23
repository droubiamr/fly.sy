"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { localePath, splitLocale } from "@/lib/site"
import { useLocale, useMessages } from "@/components/messages-provider"
import { NAV_ITEMS, isActive } from "@/components/nav-items"

/**
 * The five sections as a floating dock on phones and iPads, where the header
 * has no room for them. Hidden navigation costs discoverability, so it stays
 * on screen; desktop gets the same five in the header instead. Built from the
 * Linkat vocabulary: the blurred page colour of its header, a hairline ring
 * for its cards, and the active tab as its filled pill button.
 */
export function BottomNav() {
  const { path } = splitLocale(usePathname())
  const locale = useLocale()
  const m = useMessages()
  return (
    // The wrapper ignores pointer events so taps either side of the dock reach
    // the page underneath; only the dock itself takes them back.
    <nav
      aria-label={m.nav}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-5 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] xl:hidden"
    >
      <ul className="pointer-events-auto mx-auto flex max-w-md items-center gap-0.5 rounded-full bg-background/80 p-1.5 ring-1 ring-foreground/10 backdrop-blur-xl">
        {NAV_ITEMS.map(({ href, key, Icon }) => {
          const active = isActive(href, path)
          return (
            <li key={href} className="min-w-0 flex-1">
              <Link
                href={localePath(locale, href)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  // A hair under half the height, so the tab's curve never sits
                  // tangent to the dock's own.
                  "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-[22px] px-0.5 text-[10.5px] font-medium leading-tight",
                  "select-none transition-colors duration-150 ease-out",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground active:bg-muted",
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
