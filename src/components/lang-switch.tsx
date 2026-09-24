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
    // A bordered 48px button with the language written out: the one control in
    // the header, and it must look like one.
    <Button asChild variant="outline" className="h-12 gap-2 rounded-xl border-[1.5px] border-input px-4 text-base font-semibold shadow-none">
      <Link href={localePath(other, path)} hrefLang={other} lang={other} aria-label={m.langSwitch}>
        <Globe className="size-5 shrink-0" aria-hidden="true" />
        {m.lang}
      </Link>
    </Button>
  )
}
