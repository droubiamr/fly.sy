import Link from "next/link"
import { linkUrl } from "@/lib/data"
import { arrow, hostOf } from "@/lib/format"
import { localePath } from "@/lib/site"
import type { Locale, Resource } from "@/lib/types"
import type { Messages } from "@/messages"

/** "Official website: damairport.gov.sy · All official links": on an airport's or a carrier's page, from the Links page's card. */
export function OfficialSite({ resource, locale, m }: { resource: Resource | undefined; locale: Locale; m: Messages }) {
  const site = resource?.links.find((l) => l.kind === "site")
  if (!resource || !site) return null
  const url = linkUrl(site, locale)
  return (
    <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
      <span>{m.links.official}:</span>
      {/* dir="ltr" keeps the host in reading order inside an Arabic sentence. */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        dir="ltr"
        className="font-medium text-foreground underline decoration-muted-foreground/40 underline-offset-[3px] hover:decoration-current"
      >
        {hostOf(url)}
      </a>
      <span aria-hidden="true">·</span>
      <Link href={localePath(locale, `/links#${resource.id}`)} className="text-primary underline-offset-4 hover:underline">
        {m.links.all} {arrow(locale)}
      </Link>
    </p>
  )
}
