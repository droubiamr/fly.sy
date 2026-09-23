import type { Metadata } from "next"
import { CheckCircle2, CircleAlert, LogOut } from "lucide-react"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { accessConfigured, authConfig, IDLE_MS, requireAdmin } from "@/lib/admin-auth"
import { getSecurity, pendingCount, type AdminSessionRow as Session, type LoginAttempt as Attempt } from "@/lib/admin-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { revokeSession } from "../actions"
import { AdminHeader } from "../_components/admin-header"

export const dynamic = "force-dynamic"

export const metadata: Metadata = { title: "Security" }


const when = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" })
const REASON: Record<string, string> = {
  password: "Wrong password",
  totp: "Wrong code",
  "totp-replay": "Code already used",
  turnstile: "Failed Turnstile",
  locked: "Locked out",
  "rate-limited": "Rate limited",
  access: "No Cloudflare Access",
}

function hasLimiter() {
  try {
    return Boolean((getCloudflareContext().env as unknown as { LOGIN_LIMITER?: unknown }).LOGIN_LIMITER)
  } catch {
    return false
  }
}

export default async function SecurityPage() {
  const me = await requireAdmin()
  const { sessions, attempts } = await getSecurity(IDLE_MS)
  const cfg = authConfig()
  const checks = [
    { on: accessConfigured(), label: "Cloudflare Access", note: "Access JWT required on every admin request" },
    { on: !cfg.missing.includes("TURNSTILE_SECRET_KEY"), label: "Turnstile", note: "Bots are stopped before the password is checked" },
    { on: !cfg.missing.includes("ADMIN_TOTP_SECRET"), label: "Authenticator code", note: "Each code works once" },
    {
      on: !cfg.missing.includes("ADMIN_PASSWORD"),
      label: "Password",
      note: cfg.passwordHash ? "Stored as a PBKDF2-SHA256 hash" : "Stored as a Cloudflare secret (write-only)",
    },
    { on: hasLimiter(), label: "Rate limiter", note: "5 tries a minute per IP at the edge" },
    { on: true, label: "Lockout", note: "5 failures per IP or 20 in total within 15 minutes" },
  ]

  return (
    <>
      <AdminHeader active="security" pending={await pendingCount()} />
      <main className="mx-auto flex max-w-4xl flex-col gap-5 px-4 py-6 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Security</h1>

        <section className="rounded-xl border bg-card p-4" aria-labelledby="checks">
          <h2 id="checks" className="mb-3 text-sm font-semibold">Protections</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {checks.map((c) => (
              <li key={c.label} className="flex items-start gap-2 text-sm">
                {c.on ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-status-open" aria-hidden="true" />
                ) : (
                  <CircleAlert className="mt-0.5 size-4 shrink-0 text-status-caution" aria-hidden="true" />
                )}
                <span>
                  <span className="font-medium">{c.label}</span> <span className="sr-only">{c.on ? "on" : "off"}</span>
                  <span className="block text-xs text-muted-foreground">{c.on ? c.note : "Off. See README → Admin sign-in."}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border bg-card p-4" aria-labelledby="sessions">
          <div className="mb-3 flex items-center gap-2">
            <h2 id="sessions" className="text-sm font-semibold">Signed-in sessions</h2>
            {(sessions as Session[]).length > 1 && (
              <form action={revokeSession} className="ms-auto">
                <input type="hidden" name="id" value="others" />
                <Button type="submit" variant="outline" className="h-11 rounded-full">
                  <LogOut aria-hidden="true" /> Sign out all others
                </Button>
              </form>
            )}
          </div>
          <ul className="flex flex-col divide-y">
            {(sessions as Session[]).map((s) => (
              <li key={s.id_hash} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
                <span className="font-medium">{s.ip ?? "Unknown IP"}</span>
                {s.country && <span className="text-muted-foreground">{s.country}</span>}
                {s.id_hash === me.id_hash && (
                  <span className="rounded-md border-[1.5px] border-status-open px-1.5 text-[10px] font-bold tracking-wide text-status-open">THIS BROWSER</span>
                )}
                <span className="w-full truncate text-xs text-muted-foreground" title={s.user_agent ?? ""}>
                  Signed in {when.format(s.created_at)} UTC · active {when.format(s.last_seen)} · ends {when.format(s.expires_at)}
                  {s.access_email ? ` · ${s.access_email}` : ""} · {s.user_agent ?? ""}
                </span>
                {s.id_hash !== me.id_hash && (
                  <form action={revokeSession}>
                    <input type="hidden" name="id" value={s.id_hash} />
                    <Button type="submit" variant="ghost" className="h-11 rounded-full">Sign out</Button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex min-w-0 flex-col rounded-xl border bg-card p-4" aria-labelledby="attempts">
          <h2 id="attempts" className="mb-3 text-sm font-semibold">Sign-in attempts <span className="font-normal text-muted-foreground">(latest 50, UTC)</span></h2>
          {(attempts as Attempt[]).length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">None yet.</p>
          ) : (
            <div className="-mx-4 overflow-x-auto px-4">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr>
                    <th scope="col" className="py-2 pe-3 text-start font-medium">When</th>
                    <th scope="col" className="py-2 pe-3 text-start font-medium">Result</th>
                    <th scope="col" className="py-2 pe-3 text-start font-medium">IP</th>
                    <th scope="col" className="py-2 pe-3 text-start font-medium">Country</th>
                    <th scope="col" className="py-2 text-start font-medium">Browser</th>
                  </tr>
                </thead>
                <tbody>
                  {(attempts as Attempt[]).map((a, i) => (
                    <tr key={`${a.ts}-${i}`} className="border-t">
                      <td className="py-2 pe-3 whitespace-nowrap text-muted-foreground tabular-nums">{when.format(a.ts)}</td>
                      <td className={cn("py-2 pe-3 whitespace-nowrap", a.ok ? "text-status-open" : "text-status-closed")}>
                        {a.ok ? "Signed in" : (REASON[a.reason ?? ""] ?? "Failed")}
                      </td>
                      <td className="py-2 pe-3 whitespace-nowrap">
                        {a.ip ? <a className="hover:underline" href={`/admin?ip=${encodeURIComponent(a.ip)}`}>{a.ip}</a> : "Unknown"}
                      </td>
                      <td className="py-2 pe-3">{a.country ?? ""}</td>
                      <td className="max-w-64 truncate py-2 text-muted-foreground" title={a.user_agent ?? ""}>{a.user_agent ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  )
}
