import { DATA } from "@/lib/data"
import { entriesOfKind } from "@/lib/entries"
import { getI18n } from "@/lib/i18n"
import { pageMetadata } from "@/lib/metadata"
import { PageHeader } from "@/components/page-header"
import { EntryList } from "@/components/entry-list"

export const generateMetadata = () => pageMetadata((m) => ({ title: m.crossings.title, description: m.crossings.lede }))

export default async function CrossingsPage() {
  const { locale, m } = await getI18n()
  return (
    <div>
      <PageHeader title={m.crossings.title} lede={m.crossings.lede} />
      <EntryList entries={entriesOfKind(DATA.entries, "land")} locale={locale} m={m} showNote />
    </div>
  )
}
