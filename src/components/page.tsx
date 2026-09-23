import { cn } from "@/lib/utils"
import type { Locale } from "@/lib/types"
import { Breadcrumbs, type Crumb } from "@/components/breadcrumbs"
import { buttonVariants } from "@/components/ui/button"

/**
 * The building blocks every page is made of, so no page invents its own
 * sizes. All of them are Linkat's: the green panel with one very large
 * headline, sections with one heading size, cards on a hairline ring with the
 * large radius, and secondary pill buttons for links to other pages.
 */

/** A card: near-white on the grey page (lighter green on a panel), a 10% ring, no shadow, no border. */
export const SURFACE = "rounded-3xl bg-card text-card-foreground ring-1 ring-foreground/10"

/** A link to another page, as a secondary pill button with a 44px target. */
export const CHIP = cn(buttonVariants({ variant: "secondary" }), "h-11 rounded-full px-4 text-sm")

/**
 * The top of every page: a green panel with the page's one headline, centred,
 * the way every screen on Linkat opens. `home` is the planner's larger size.
 */
export function PageHero({
  locale,
  crumbs,
  title,
  lede,
  size = "page",
  media,
  children,
}: {
  locale: Locale
  crumbs?: Crumb[]
  title: React.ReactNode
  lede?: React.ReactNode
  size?: "home" | "page"
  /** A logo or mark above the headline, such as an airline's. */
  media?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <section className="panel pt-10 pb-20 md:pt-16 md:pb-28">
      <div className="container-app text-center">
        {crumbs && <Breadcrumbs locale={locale} items={crumbs} />}
        {media && <div className="mb-5 flex justify-center">{media}</div>}
        <h1
          className={cn(
            "text-balance font-bold leading-[1.02] tracking-tighter",
            size === "home" ? "text-5xl md:text-7xl" : "text-4xl md:text-6xl",
          )}
        >
          {title}
        </h1>
        {lede && <p className="mx-auto mt-4 max-w-xl text-balance text-base text-muted-foreground md:mt-5 md:text-lg">{lede}</p>}
        {children}
      </div>
    </section>
  )
}

/** A section of a page: one heading size everywhere, an optional line under it. */
export function Section({
  id,
  title,
  note,
  children,
  className,
}: {
  id: string
  title: React.ReactNode
  note?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section aria-labelledby={id} className={cn("scroll-mt-24", className)}>
      <h2 id={id} className="text-balance text-2xl font-bold tracking-tight md:text-3xl">
        {title}
      </h2>
      {note && <p className="mt-1.5 text-sm text-muted-foreground">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

/**
 * The page body under the panel, in the stepped container. `narrow` is
 * Linkat's 680px reading column for pages that are mostly prose; a max width
 * inside a fixed container is still a fixed number, so it stays stepped.
 */
export function PageBody({ children, narrow, className }: { children: React.ReactNode; narrow?: boolean; className?: string }) {
  return (
    <div className="container-app mt-12 md:mt-16">
      <div className={cn("flex flex-col gap-14", narrow && "mx-auto max-w-[680px]", className)}>{children}</div>
    </div>
  )
}
