"use server"

import { getCloudflareContext } from "@opennextjs/cloudflare"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { ABSOLUTE_MS, accessIdentity, authConfig, requireAdmin, SESSION_COOKIE } from "@/lib/admin-auth"
import { checkAdminPassword, newSessionToken, tokenHash, totpStep } from "@/lib/auth-crypto"
import { clientIp, countryFrom } from "@/lib/analytics"
import { db } from "@/lib/db"
import { verifyTurnstile } from "@/lib/turnstile"

export type LoginState = { error: "failed" | "locked" | "disabled" } | null

// Durable lockout, counted in D1: 5 failures from one IP, or 20 from anywhere (the account itself), within
// 15 minutes closes the form until the window moves on.
const WINDOW_MS = 15 * 60 * 1000
const MAX_PER_IP = 5
const MAX_TOTAL = 20

type Limiter = { limit(o: { key: string }): Promise<{ success: boolean }> }
function limiter(): Limiter | null {
  try {
    return (getCloudflareContext().env as unknown as { LOGIN_LIMITER?: Limiter }).LOGIN_LIMITER ?? null
  } catch {
    return null
  }
}

/**
 * Password, authenticator code and Turnstile in one submit, so there is no half-signed-in state to attack.
 * Every failure gets the same answer; which check failed is written only to login_attempts.
 */
export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const cfg = authConfig()
  const d = db()
  if (cfg.missing.length || !d) return { error: "disabled" }

  const h = await headers()
  const ip = clientIp(h)
  const ua = h.get("user-agent")?.slice(0, 500) ?? null
  const country = countryFrom(h.get("cf-ipcountry"))
  const now = Date.now()
  const record = (ok: boolean, reason: string | null) =>
    d
      .prepare("insert into login_attempts (ts, ip, country, user_agent, ok, reason) values (?, ?, ?, ?, ?, ?)")
      .bind(now, ip, country, ua, ok ? 1 : 0, reason)
      .run()
      .catch(() => {})

  const access = await accessIdentity()
  if (!access.ok) {
    await record(false, "access")
    return { error: "failed" }
  }

  // Edge throttle first: it is the cheapest check.
  const rl = limiter()
  if (rl && !(await rl.limit({ key: `admin-login:${ip ?? "unknown"}` })).success) {
    await record(false, "rate-limited")
    return { error: "locked" }
  }

  const [byIp, total] = await d.batch<{ n: number }>([
    d.prepare("select count(*) as n from login_attempts where ok = 0 and ip is ? and ts > ?").bind(ip, now - WINDOW_MS),
    d.prepare("select count(*) as n from login_attempts where ok = 0 and ts > ?").bind(now - WINDOW_MS),
  ])
  if (byIp.results[0].n >= MAX_PER_IP || total.results[0].n >= MAX_TOTAL) {
    await record(false, "locked")
    return { error: "locked" }
  }

  const human = await verifyTurnstile({
    secret: cfg.turnstileSecret,
    token: String(form.get("cf-turnstile-response") ?? ""),
    ip,
    host: (h.get("host") ?? "").split(":")[0],
  })
  // The password is checked even when Turnstile failed, so the answer takes as long either way.
  const passwordOk = await checkAdminPassword(String(form.get("password") ?? ""), cfg)
  const step = totpStep(cfg.totpSecret, String(form.get("code") ?? "").replace(/\s/g, ""))
  if (!human || !passwordOk || step === null) {
    await record(false, !human ? "turnstile" : !passwordOk ? "password" : "totp")
    return { error: "failed" }
  }

  // Each code works once: the step must be newer than the last one accepted, and the update is atomic.
  const claimed = await d.prepare("update admin_state set value = ? where key = 'totp_step' and value < ?").bind(step, step).run()
  if (!claimed.meta.changes) {
    await record(false, "totp-replay")
    return { error: "failed" }
  }

  // A fresh token every sign-in (no session fixation); the old one, if any, is destroyed.
  const jar = await cookies()
  const old = jar.get(SESSION_COOKIE)?.value
  const token = newSessionToken()
  await d.batch([
    d.prepare("delete from admin_sessions where expires_at < ? or id_hash = ?").bind(now, old ? await tokenHash(old) : ""),
    d
      .prepare(
        "insert into admin_sessions (id_hash, created_at, last_seen, expires_at, ip, country, user_agent, access_email) values (?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .bind(await tokenHash(token), now, now, now + ABSOLUTE_MS, ip, country, ua, access.email ?? null),
  ])
  await record(true, null)

  jar.set(SESSION_COOKIE, token, { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: ABSOLUTE_MS / 1000 })
  redirect("/admin")
}

export async function logout() {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  const d = db()
  if (token && d) await d.prepare("delete from admin_sessions where id_hash = ?").bind(await tokenHash(token)).run().catch(() => {})
  jar.delete(SESSION_COOKIE)
  redirect("/admin/login")
}

/** Signs one session out, or with id "others", every session except this one. */
export async function revokeSession(form: FormData) {
  const me = await requireAdmin()
  const id = String(form.get("id") ?? "")
  const d = db()
  if (!d) return
  if (id === "others") await d.prepare("delete from admin_sessions where id_hash != ?").bind(me.id_hash).run()
  else if (/^[0-9a-f]{64}$/.test(id)) await d.prepare("delete from admin_sessions where id_hash = ?").bind(id).run()
  revalidatePath("/admin/security")
}

const DECISIONS = { publish: "published", reject: "rejected", pending: "pending" } as const

/** Moves one community report between pending, published and rejected. */
export async function moderate(form: FormData) {
  await requireAdmin()
  const id = String(form.get("id") ?? "")
  const decision = String(form.get("decision") ?? "")
  if (!Object.hasOwn(DECISIONS, decision) || !/^[0-9a-f-]{36}$/i.test(id)) return
  const status = DECISIONS[decision as keyof typeof DECISIONS]
  const d = db()
  if (!d) return
  try {
    await d
      .prepare("update reports set status = ?, reviewed_by = ?, published_at = ? where id = ?")
      .bind(status, status === "pending" ? null : "admin", status === "published" ? Date.now() : null, id)
      .run()
  } catch (e) {
    console.error("report not updated:", e)
  }
  revalidatePath("/admin/reports")
}
