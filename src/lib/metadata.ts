import type { Metadata } from "next"
import { getI18n } from "./i18n"
import type { Messages } from "@/messages"

/** Per-page title and description in the current language. The root layout supplies the "· fly.sy" suffix. */
export async function pageMetadata(pick: (m: Messages) => { title: string; description?: string }): Promise<Metadata> {
  const { m } = await getI18n()
  return pick(m)
}
