import Link from "next/link"
import { getI18n } from "@/lib/i18n"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"

export default async function NotFound() {
  const { m } = await getI18n()
  return (
    <div>
      <PageHeader title={m.notFound.title} lede={m.notFound.text} />
      <Button asChild variant="secondary" className="h-11 rounded-full px-5 shadow-none">
        <Link href="/">{m.notFound.home}</Link>
      </Button>
    </div>
  )
}
