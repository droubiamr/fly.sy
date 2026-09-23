import { ExternalLink } from "lucide-react"
import { DATA } from "@/lib/data"
import { getI18n } from "@/lib/i18n"
import { pageMetadata } from "@/lib/metadata"
import { REPO_URL } from "@/lib/site"
import { PageHeader } from "@/components/page-header"
import { Section } from "@/components/section"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const generateMetadata = () => pageMetadata((m) => ({ title: m.about.title, description: m.about.lede }))

export default async function AboutPage() {
  const { locale, m } = await getI18n()
  const levels = ["verified", "reported", "unconfirmed"] as const
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={m.about.title} lede={m.about.lede} />

      <Section id="levels" title={m.about.levels}>
        <ul className="divide-y rounded-2xl border bg-card px-5">
          {levels.map((k) => (
            <li key={k} className="flex items-start gap-3 py-3">
              <Badge variant="secondary" className="shrink-0">
                {m.confidence[k]}
              </Badge>
              <p className="text-[13.5px] leading-relaxed">{m.about.lv[k]}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="sources" title={m.about.sources}>
        <ul className="divide-y rounded-2xl border bg-card px-5">
          {Object.entries(DATA.sources).map(([id, s]) => (
            <li key={id} className="flex items-start justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-semibold">{s.name[locale]}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">{s.use[locale]}</p>
              </div>
              <span className="shrink-0 pt-0.5 text-[11px] font-semibold text-muted-foreground">{s.kind[locale]}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="open" title={m.about.open}>
        <p className="max-w-prose text-[13.5px] leading-relaxed text-muted-foreground">{m.about.openText}</p>
        <Button asChild variant="secondary" className="mt-3 h-11 rounded-full px-5 shadow-none">
          <a href={REPO_URL} rel="noopener">
            {m.about.contribute}
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </Button>
      </Section>

      <p className="max-w-prose text-xs leading-relaxed text-muted-foreground">{m.about.fine}</p>
    </div>
  )
}
