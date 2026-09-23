import type { Metadata } from "next"
import { DATA } from "@/lib/data"
import { getI18n } from "@/lib/i18n"
import { Badge } from "@/components/ui/badge"
import { SourceLink } from "@/components/source-link"

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n()
  return { title: m.tabs.about }
}

export default async function AboutPage() {
  const { locale, m } = await getI18n()
  const levels = ["verified", "reported", "unconfirmed"] as const
  return (
    <div className="flex flex-col gap-7">
      <section>
        <h1 className="text-2xl font-bold tracking-tight">{m.about.title}</h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">{m.about.lede}</p>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">{m.about.levels}</h2>
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
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">{m.about.sources}</h2>
        <ul className="divide-y rounded-2xl border bg-card px-5">
          {Object.entries(DATA.sources).map(([id, s]) => (
            <li key={id} className="flex items-start justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-semibold">
                  <SourceLink source={s}>{s.name[locale]}</SourceLink>
                </p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">{s.use[locale]}</p>
              </div>
              <span className="shrink-0 pt-0.5 text-[11px] font-semibold text-muted-foreground">{s.kind[locale]}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">{m.about.open}</h2>
        <p className="text-[13.5px] leading-relaxed text-muted-foreground">{m.about.openText}</p>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">{m.about.contact}</h2>
        <p className="text-[13.5px] leading-relaxed text-muted-foreground">
          {m.about.contactText}{" "}
          {/* dir="ltr" keeps the address in reading order inside an Arabic sentence. */}
          <a
            href={`mailto:${DATA.meta.contact}`}
            dir="ltr"
            className="font-medium text-foreground underline decoration-muted-foreground/40 underline-offset-[3px] hover:decoration-current"
          >
            {DATA.meta.contact}
          </a>
        </p>
      </section>

      <p className="text-xs leading-relaxed text-muted-foreground">{m.about.fine}</p>
    </div>
  )
}
