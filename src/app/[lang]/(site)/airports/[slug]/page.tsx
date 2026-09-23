import type { Metadata } from "next"
import { LOCALES } from "@/lib/site"
import { EntryPage, entryMetadata, entryParams, type EntryParams } from "@/components/entry-page"

type Props = { params: Promise<EntryParams> }

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => entryParams("air").map((p) => ({ lang, ...p })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return entryMetadata(await params, "air")
}

export default async function Page({ params }: Props) {
  return EntryPage(await params, "air")
}
