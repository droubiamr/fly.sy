import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { createRemoteJWKSet, jwtVerify } from "jose"
import { tokenHash } from "./auth-crypto"
import { SESSION_COOKIE } from "./admin-cookie"
import { db } from "./db"

/**
 * Admin authentication, server side. Layers, outermost first:
 *   1. Cloudflare Access in front of /admin* (configured in the Zero Trust dashboard). When CF_ACCESS_TEAM_DOMAIN
 *      and CF_ACCESS_AUD are set, every admin request must also carry a valid Access JWT, checked here, so a
 *      misconfigured Access rule or a request that reaches the Worker another way still gets nothing.
 *   2. The sign-in form (see app/admin/actions.ts): Turnstile, rate limits, lockout, password, TOTP.
 *   3. A server-side session in D1, 30 minutes idle and 8 hours absolute, or 30 days with no idle timeout when
 *      "Keep me signed in" is ticked; revocable from /admin/security.
 */

export { SESSION_COOKIE }
export const IDLE_MS = 30 * 60 * 1000
export const ABSOLUTE_MS = 8 * 60 * 60 * 1000
// "Keep me signed in". A kept session is told apart by its lifetime alone (longer than ABSOLUTE_MS), so
// admin_sessions needs no column for it and old rows keep their meaning.
export const KEEP_MS = 30 * 24 * 60 * 60 * 1000

/** SQL condition: the session is live at time ?1. Inside its absolute timeout, and its idle one unless kept. */
export const LIVE_SESSION = `expires_at > ?1 and (last_seen > ?1 - ${IDLE_MS} or expires_at - created_at > ${ABSOLUTE_MS})`

export const isKept = (s: { created_at: number; expires_at: number }) => s.expires_at - s.created_at > ABSOLUTE_MS

export type AdminSession = {
  id_hash: string
  created_at: number
  last_seen: number
  expires_at: number
  ip: string | null
  access_email: string | null
}

/** What sign-in needs before it will run at all. Missing entries switch the form off. */
export function authConfig() {
  const env = process.env
  // Forgive what pasting into a dashboard field tends to add: surrounding spaces and line breaks, and an
  // authenticator key typed in lower case or in groups. The password keeps inner and leading spaces.
  const cfg = {
    passwordHash: (env.ADMIN_PASSWORD_HASH ?? "").trim(),
    password: (env.ADMIN_PASSWORD ?? "").replace(/[\r\n]+$/, ""),
    totpSecret: (env.ADMIN_TOTP_SECRET ?? "").replace(/[\s-]/g, "").toUpperCase(),
    turnstileSiteKey: (env.TURNSTILE_SITE_KEY ?? "").trim(),
    turnstileSecret: (env.TURNSTILE_SECRET_KEY ?? "").trim(),
  }
  // Names only: this list is shown on the sign-in page while sign-in is off, so it must never carry a value.
  const missing = [
    // Either the hash or the password itself (12+ characters) as a secret.
    !cfg.passwordHash.startsWith("pbkdf2-sha256:") && cfg.password.length < 12 && "ADMIN_PASSWORD",
    !/^[A-Z2-7]{32,}$/.test(cfg.totpSecret) && "ADMIN_TOTP_SECRET",
    !cfg.turnstileSiteKey && "TURNSTILE_SITE_KEY",
    !cfg.turnstileSecret && "TURNSTILE_SECRET_KEY",
  ].filter((x): x is string => Boolean(x))
  return { ...cfg, missing }
}

// ——— Cloudflare Access ———

// Module scope, so jose's key cache survives between requests in the same isolate.
let jwks: { url: string; set: ReturnType<typeof createRemoteJWKSet> } | null = null

export const accessConfigured = () => Boolean(process.env.CF_ACCESS_TEAM_DOMAIN && process.env.CF_ACCESS_AUD)

/**
 * The Access identity on this request. `{ ok: true }` with no email when Access is not configured; `{ ok: false }`
 * when it is configured and the JWT is missing, expired, for another application or not signed by the team.
 */
export async function accessIdentity(): Promise<{ ok: boolean; email?: string }> {
  if (!accessConfigured()) return { ok: true }
  const team = process.env.CF_ACCESS_TEAM_DOMAIN!.replace(/\/+$/, "")
  const token = (await headers()).get("cf-access-jwt-assertion")
  if (!token) return { ok: false }
  const url = `${team}/cdn-cgi/access/certs`
  if (jwks?.url !== url) jwks = { url, set: createRemoteJWKSet(new URL(url)) }
  try {
    const { payload } = await jwtVerify(token, jwks.set, { issuer: team, audience: process.env.CF_ACCESS_AUD })
    return { ok: true, email: typeof payload.email === "string" ? payload.email : undefined }
  } catch {
    return { ok: false }
  }
}

// ——— Sessions ———

/** The signed-in admin's session, or null. Slides the idle timeout; never extends the absolute one. */
export async function currentAdmin(): Promise<AdminSession | null> {
  // Cookies first and unconditionally: reading them is what makes a page dynamic.
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null
  if (!(await accessIdentity()).ok) return null
  const d = db()
  if (!d) return null
  const now = Date.now()
  const id = await tokenHash(token)
  const row = await d
    .prepare(`select id_hash, created_at, last_seen, expires_at, ip, access_email from admin_sessions where id_hash = ?2 and ${LIVE_SESSION}`)
    .bind(now, id)
    .first<AdminSession>()
    .catch(() => null)
  if (!row) return null
  // One write a minute at most, not one per request.
  if (now - row.last_seen > 60_000) {
    await d.prepare("update admin_sessions set last_seen = ? where id_hash = ?").bind(now, id).run().catch(() => {})
  }
  return row
}

/** For every admin page and every admin Server Action: a Server Action is a public endpoint, so each one checks. */
export async function requireAdmin(): Promise<AdminSession> {
  const s = await currentAdmin()
  if (!s) redirect("/admin/login")
  return s
}
