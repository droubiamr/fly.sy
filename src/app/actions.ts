"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { LOCALE_COOKIE } from "@/lib/i18n"

export async function toggleLocale() {
  const jar = await cookies()
  const next = jar.get(LOCALE_COOKIE)?.value === "en" ? "ar" : "en"
  jar.set(LOCALE_COOKIE, next, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" })
  revalidatePath("/", "layout")
}
