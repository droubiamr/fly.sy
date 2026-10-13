"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { localePath, otherLocale, splitLocale } from "@/lib/site"
import { useLocale, useMessages } from "@/components/messages-provider"
import { passportQuery, useUrlPassport } from "@/components/passport-state"
import { Button } from "@/components/ui/button"

/** A plain link to the same page in the other language. A link, not a cookie: each language has its own URL. A
 *  route page's passport (?p=) goes along, so the other language answers for the same passport. */
export function LangSwitch() {
  const locale = useLocale()
  const m = useMessages()
  const other = otherLocale(locale)
  const { path } = splitLocale(usePathname())
  const passport = useUrlPassport()
  return (
    <Button asChild variant="outline" className="h-11 px-3.5 text-[13px]">
      <Link href={localePath(other, path) + passportQuery(passport)} hrefLang={other} lang={other} aria-label={m.langSwitch}>
        {m.lang}
      </Link>
    </Button>
  )
}
