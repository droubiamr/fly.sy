import { cookies } from "next/headers"
import type { Locale, Text } from "./types"
import { getMessages } from "@/messages"

export const LOCALE_COOKIE = "lang"

export async function getLocale(): Promise<Locale> {
  const v = (await cookies()).get(LOCALE_COOKIE)?.value
  return v === "en" ? "en" : "ar"
}

export async function getI18n() {
  const locale = await getLocale()
  return { locale, m: getMessages(locale), t: (x: Text | undefined) => (x ? x[locale] ?? x.ar : "") }
}

export const tx = (x: Text | undefined, locale: Locale) => (x ? x[locale] ?? x.ar : "")
