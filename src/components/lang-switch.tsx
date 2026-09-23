"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Languages } from "lucide-react"
import { localePath, otherLocale, splitLocale } from "@/lib/site"
import { useLocale, useMessages } from "@/components/messages-provider"
import { cn } from "@/lib/utils"

/**
 * The same page in the other language, as Linkat's header shows it: the
 * translate glyph and the language's own name. A link, not a cookie: each
 * language has its own URL. The negative margin grows the tap area to 44px
 * without moving the text.
 */
export function LangSwitch({ className }: { className?: string }) {
  const locale = useLocale()
  const m = useMessages()
  const other = otherLocale(locale)
  const { path } = splitLocale(usePathname())
  return (
    <Link
      href={localePath(other, path)}
      hrefLang={other}
      lang={other}
      aria-label={m.langSwitch}
      className={cn("-my-3 flex items-center gap-1.5 py-3 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground", className)}
    >
      <Languages className="size-4 shrink-0" aria-hidden="true" />
      {m.lang}
    </Link>
  )
}
