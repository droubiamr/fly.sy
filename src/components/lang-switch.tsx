"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Globe } from "lucide-react"
import { localePath, otherLocale, splitLocale } from "@/lib/site"
import { useLocale, useMessages } from "@/components/messages-provider"
import { Button } from "@/components/ui/button"

/** A plain link to the same page in the other language. A link, not a cookie: each language has its own URL. */
export function LangSwitch() {
  const locale = useLocale()
  const m = useMessages()
  const other = otherLocale(locale)
  const { path } = splitLocale(usePathname())
  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      // A real 44px control inside the pill, rather than an invisible tap area
      // spilling out past the chrome the user can actually see.
      className="h-11 gap-1.5 rounded-full px-3.5 text-[11.5px] font-medium tracking-wide"
    >
      <Link href={localePath(other, path)} hrefLang={other} lang={other} aria-label={m.langSwitch}>
        {/* A globe, not the translate glyph: that one is two characters of
            detail and turns to mush at 14px. */}
        <Globe className="size-3.5 shrink-0" aria-hidden="true" />
        {m.lang}
      </Link>
    </Button>
  )
}
