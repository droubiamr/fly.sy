"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, Landmark, MapPin, MessagesSquare, Newspaper, Plane } from "lucide-react"
import { cn } from "@/lib/utils"
import { localePath, splitLocale } from "@/lib/site"
import { useLocale, useMessages } from "@/components/messages-provider"

/** The sections, once. The phone's tab bar and the desktop's top bar both read this list. */
const ITEMS = [
  { href: "/", key: "trip", Icon: MapPin, on: (p: string) => p === "/" || p.startsWith("/from/") },
  { href: "/airlines", key: "flights", Icon: Plane, on: (p: string) => p.startsWith("/airlines") },
  { href: "/crossings", key: "borders", Icon: Landmark, on: (p: string) => p.startsWith("/crossings") || p.startsWith("/airports") },
  { href: "/documents", key: "papers", Icon: FileText, on: (p: string) => p.startsWith("/documents") },
  { href: "/news", key: "news", Icon: Newspaper, on: (p: string) => p.startsWith("/news") },
  { href: "/reports", key: "experiences", Icon: MessagesSquare, on: (p: string) => p.startsWith("/reports") },
] as const

/**
 * "top": links across the header on a wide screen, the current one a green sign plate.
 * "bar": the phone's tab bar, fixed to the bottom, the current icon set on a plate.
 */
export function MainNav({ variant }: { variant: "top" | "bar" }) {
  const { path } = splitLocale(usePathname())
  const locale = useLocale()
  const m = useMessages()

  if (variant === "top") {
    return (
      <nav aria-label={m.nav.label} className="hidden items-center gap-1 lg:flex">
        {ITEMS.map(({ href, key, on }) => (
          <Link
            key={href}
            href={localePath(locale, href)}
            aria-current={on(path) ? "page" : undefined}
            className={cn(
              "inline-flex h-10 items-center rounded-lg px-3 text-[15px] font-semibold transition-colors duration-150 ease-out",
              on(path)
                ? "bg-primary text-primary-foreground shadow-[inset_0_0_0_3px_var(--primary),inset_0_0_0_4.5px_var(--primary-foreground)]"
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
            )}
          >
            {m.nav[key]}
          </Link>
        ))}
      </nav>
    )
  }

  return (
    <nav
      aria-label={m.nav.label}
      className="fixed inset-x-0 bottom-0 z-20 border-t bg-card pb-[env(safe-area-inset-bottom,0px)] lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-6">
        {ITEMS.map(({ href, key, Icon, on }) => {
          const active = on(path)
          return (
            <li key={href}>
              <Link
                href={localePath(locale, href)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 px-0 text-[11px] leading-tight tracking-tight select-none",
                  active ? "font-bold text-primary" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid h-7 w-11 place-items-center rounded-md transition-colors duration-150 ease-out",
                    active && "bg-primary text-primary-foreground",
                  )}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
                </span>
                <span className="w-full truncate text-center">{m.nav[key]}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
