"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ABOUT, NAV, isActive } from "@/lib/nav"
import { cn } from "@/lib/utils"
import { useMessages } from "@/components/messages-provider"

/** Section links for tablet and desktop. The phone gets the dock instead. */
export function HeaderNav() {
  const path = usePathname()
  const m = useMessages()
  return (
    <nav aria-label="Main" className="ms-3 hidden items-center gap-0.5 md:flex">
      {[...NAV, ABOUT].map(({ href, key }) => {
        const active = isActive(href, path)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-9 items-center rounded-full px-3 text-[13px] transition-colors duration-150 ease-out",
              active ? "bg-secondary font-semibold text-secondary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m.nav[key]}
          </Link>
        )
      })}
    </nav>
  )
}
