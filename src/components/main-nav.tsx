"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { localePath, splitLocale } from "@/lib/site"
import { useLocale, useMessages } from "@/components/messages-provider"
import { NAV_ITEMS, isActive } from "@/components/nav-items"
import { cn } from "@/lib/utils"

/** The header's middle column on desktop, as on Linkat: plain words, the current one in the text colour. */
export function MainNav() {
  const { path } = splitLocale(usePathname())
  const locale = useLocale()
  const m = useMessages()
  return (
    <nav aria-label={m.nav} className="mx-8 hidden items-center gap-7 text-sm font-medium text-muted-foreground xl:flex">
      {NAV_ITEMS.map(({ href, key }) => {
        const active = isActive(href, path)
        return (
          <Link
            key={href}
            href={localePath(locale, href)}
            aria-current={active ? "page" : undefined}
            className={cn("transition-colors duration-200 hover:text-foreground", active && "text-foreground")}
          >
            {m.tabs[key]}
          </Link>
        )
      })}
    </nav>
  )
}
