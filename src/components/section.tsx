import Link from "next/link"

/** A titled block on a page: heading on the start side, an optional link or note on the end side. */
export function Section({
  id,
  title,
  aside,
  more,
  children,
}: {
  id: string
  title: React.ReactNode
  aside?: React.ReactNode
  more?: { href: string; label: string }
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={id}>
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <h2 id={id} className="text-[15px] font-semibold">
          {title}
        </h2>
        {more ? (
          <Link href={more.href} className="shrink-0 text-[13px] font-medium text-primary underline-offset-4 hover:underline">
            {more.label}
          </Link>
        ) : (
          aside && <span className="text-xs text-muted-foreground">{aside}</span>
        )}
      </div>
      {children}
    </section>
  )
}
