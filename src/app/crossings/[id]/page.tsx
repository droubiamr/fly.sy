import { notFound } from "next/navigation"
import { DATA } from "@/lib/data"
import { getI18n } from "@/lib/i18n"
import { EntryPage } from "@/components/entry-page"

type Params = { params: Promise<{ id: string }> }

const crossing = (id: string) => {
  const e = DATA.entries[id]
  return e && e.kind === "land" ? e : null
}

export async function generateMetadata({ params }: Params) {
  const e = crossing((await params).id)
  const { locale, m } = await getI18n()
  return e ? { title: e.name[locale], description: `${m.kind.land} · ${m.status[e.status]}` } : {}
}

export default async function CrossingPage({ params }: Params) {
  const { id } = await params
  const e = crossing(id)
  if (!e) notFound()
  return <EntryPage id={id} entry={e} />
}
