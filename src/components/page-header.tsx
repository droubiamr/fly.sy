import Link from "next/link"
import { ChevronLeft } from "lucide-react"

/** Title and one-line lede at the top of every section page. `back` gives detail pages a way up. */
export function PageHeader({
  title,
  lede,
  eyebrow,
  back,
  children,
}: {
  title: React.ReactNode
  lede?: React.ReactNode
  eyebrow?: React.ReactNode
  back?: { href: string; label: string }
  children?: React.ReactNode
}) {
  return (
    <header className="mb-6">
      {back && (
        <Link
          href={back.href}
          className="relative -ms-1 mb-2 inline-flex min-h-11 items-center gap-0.5 text-[13px] font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
          {back.label}
        </Link>
      )}
      {eyebrow && <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{eyebrow}</p>}
      <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-[28px]">{title}</h1>
      {lede && <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-muted-foreground">{lede}</p>}
      {children && <div className="mt-4">{children}</div>}
    </header>
  )
}
