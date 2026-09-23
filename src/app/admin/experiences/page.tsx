import type { Metadata } from "next"
import Link from "next/link"
import { Check, Clock, EyeOff, Mail, RotateCcw, X } from "lucide-react"
import { requireAdmin } from "@/lib/admin-auth"
import { getReports, type AdminReport, type ReportStatus } from "@/lib/admin-data"
import { DATA } from "@/lib/data"
import { formatDate, formatMinutes } from "@/lib/format"
import { getMessages } from "@/messages"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { moderate } from "../actions"
import { AdminHeader } from "../_components/admin-header"
import { SetupNotice } from "../_components/setup-notice"

export const dynamic = "force-dynamic"

export const metadata: Metadata = { title: "Experiences" }

type Props = { searchParams: Promise<{ status?: string }> }

const TABS: { status: ReportStatus; label: string }[] = [
  { status: "pending", label: "Pending" },
  { status: "published", label: "Published" },
  { status: "rejected", label: "Rejected" },
]
const isStatus = (v: unknown): v is ReportStatus => v === "pending" || v === "published" || v === "rejected"
const en = getMessages("en")
const submitted = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" })

export default async function ExperiencesAdminPage({ searchParams }: Props) {
  await requireAdmin()
  const { status: raw } = await searchParams
  const status = isStatus(raw) ? raw : "pending"
  const queue = await getReports(status)

  return (
    <>
      <AdminHeader active="experiences" pending={queue.ok ? queue.counts.pending : 0} />
      <main className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="me-auto text-2xl font-bold tracking-tight">Traveller experiences</h1>
          <nav aria-label="Status" className="inline-flex rounded-full border bg-card p-1">
            {TABS.map((t) => (
              <Link
                key={t.status}
                href={t.status === "pending" ? "/admin/experiences" : `/admin/experiences?status=${t.status}`}
                aria-current={t.status === status ? "true" : undefined}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  t.status === status && "bg-primary text-primary-foreground hover:text-primary-foreground",
                )}
              >
                {t.label}
                {queue.ok && <span className="text-xs opacity-80 tabular-nums">{queue.counts[t.status]}</span>}
              </Link>
            ))}
          </nav>
        </div>

        {!queue.ok ? (
          <SetupNotice reason={queue.reason} message={queue.message} />
        ) : queue.reports.length === 0 ? (
          <p className="rounded-xl border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            {status === "pending" ? "Nothing waiting. New experiences sent from the site land here." : "None."}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {queue.reports.map((r) => (
              <ReportCard key={r.id} r={r} />
            ))}
          </ul>
        )}
      </main>
    </>
  )
}

function ReportCard({ r }: { r: AdminReport }) {
  const entry = DATA.entries[r.entry]
  const wait = formatMinutes(r.wait_minutes, "en")
  return (
    <li className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-semibold">{entry ? entry.name.en : r.entry}</h2>
        <span className="text-sm text-muted-foreground">travelled {formatDate(r.travelled_on, "en")}</span>
        <span className="ms-auto text-xs text-muted-foreground tabular-nums">sent {submitted.format(new Date(r.created_at))} UTC</span>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-md border px-2 py-0.5">{en.reports.form.passports[r.passport]}</span>
        {wait && (
          <span className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5">
            <Clock className="size-3" aria-hidden="true" />
            {wait}
          </span>
        )}
      </div>
      <p className="text-[15px] leading-relaxed whitespace-pre-line break-words">{r.note}</p>
      {r.contact && (
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="size-4 shrink-0" aria-hidden="true" />
          <span className="break-all">{r.contact}</span>
          <span className="text-xs">(private, never published)</span>
        </p>
      )}
      <form action={moderate} className="flex flex-wrap gap-2 border-t pt-3">
        <input type="hidden" name="id" value={r.id} />
        {r.status !== "published" && (
          <Button type="submit" name="decision" value="publish" className="h-11 rounded-full px-5">
            <Check aria-hidden="true" /> Publish
          </Button>
        )}
        {r.status === "pending" && (
          <Button type="submit" name="decision" value="reject" variant="outline" className="h-11 rounded-full px-5">
            <X aria-hidden="true" /> Reject
          </Button>
        )}
        {r.status === "published" && (
          <Button type="submit" name="decision" value="reject" variant="outline" className="h-11 rounded-full px-5">
            <EyeOff aria-hidden="true" /> Unpublish
          </Button>
        )}
        {r.status !== "pending" && (
          <Button type="submit" name="decision" value="pending" variant="ghost" className="h-11 rounded-full px-5">
            <RotateCcw aria-hidden="true" /> Back to pending
          </Button>
        )}
      </form>
    </li>
  )
}
