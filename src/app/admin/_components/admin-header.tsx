import Link from "next/link"
import { BarChart3, ExternalLink, LogOut, MessagesSquare, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { logout } from "../actions"

const TABS = [
  { href: "/admin", key: "traffic", label: "Traffic", Icon: BarChart3 },
  { href: "/admin/reports", key: "reports", label: "Reports", Icon: MessagesSquare },
  { href: "/admin/security", key: "security", label: "Security", Icon: ShieldCheck },
] as const

export function AdminHeader({ active, pending }: { active: (typeof TABS)[number]["key"]; pending: number }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:px-6">
        <Link href="/admin" dir="ltr" className="me-2 text-[19px] font-bold tracking-tight">
          fly<span className="text-primary">.sy</span>
          <span className="ms-2 align-middle text-xs font-medium tracking-wide text-muted-foreground">admin</span>
        </Link>
        <nav aria-label="Admin" className="flex items-center gap-1">
          {TABS.map(({ href, key, label, Icon }) => (
            <Link
              key={key}
              href={href}
              aria-current={active === key ? "page" : undefined}
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:px-4",
                active === key && "bg-secondary text-secondary-foreground hover:text-secondary-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="max-sm:sr-only">{label}</span>
              {key === "reports" && pending > 0 && (
                <span className="rounded-full bg-primary px-1.5 text-[11px] leading-5 font-bold text-primary-foreground">
                  {pending}
                  <span className="sr-only"> pending</span>
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-1">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex size-11 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
            aria-label="Open the site"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex size-11 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut className="size-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
