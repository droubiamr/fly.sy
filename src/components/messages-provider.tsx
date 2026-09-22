"use client"

import { createContext, useContext } from "react"
import type { Messages } from "@/messages"
import type { Locale } from "@/lib/types"

const Ctx = createContext<{ locale: Locale; m: Messages } | null>(null)

export function MessagesProvider({ locale, m, children }: { locale: Locale; m: Messages; children: React.ReactNode }) {
  return <Ctx.Provider value={{ locale, m }}>{children}</Ctx.Provider>
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
