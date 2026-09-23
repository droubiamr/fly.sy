"use client"

import { createContext, useContext } from "react"
import { Direction } from "radix-ui"
import type { Messages } from "@/messages"
import type { Locale } from "@/lib/types"

const Ctx = createContext<{ locale: Locale; m: Messages } | null>(null)

export function MessagesProvider({ locale, m, children }: { locale: Locale; m: Messages; children: React.ReactNode }) {
  return (
    <Ctx.Provider value={{ locale, m }}>
      {/* Radix primitives (Select, ToggleGroup, …) do not read the document's
          dir attribute: without this provider every one of them assumes LTR, so a
          dropdown opened on the Arabic site renders its list left to right. One
          provider here, at the root, sets them all; see
          https://www.radix-ui.com/primitives/docs/utilities/direction-provider */}
      <Direction.Provider dir={locale === "ar" ? "rtl" : "ltr"}>{children}</Direction.Provider>
    </Ctx.Provider>
  )
}

export function useMessages() {
  const v = useContext(Ctx)
  if (!v) throw new Error("MessagesProvider missing")
  return v.m
}

export function useLocale() {
  const v = useContext(Ctx)
  if (!v) throw new Error("MessagesProvider missing")
  return v.locale
}
