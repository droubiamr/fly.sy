import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { createRemoteJWKSet, jwtVerify } from "jose"
import { tokenHash } from "./auth-crypto"
import { db } from "./db"

/**
 * Admin authentication, server side. Layers, outermost first:
 *   1. Cloudflare Access in front of /admin* (configured in the Zero Trust dashboard). When CF_ACCESS_TEAM_DOMAIN
 *      and CF_ACCESS_AUD are set, every admin request must also carry a valid Access JWT, checked here, so a
 *      misconfigured Access rule or a request that reaches the Worker another way still gets nothing.
 *   2. The sign-in form (see app/admin/actions.ts): Turnstile, rate limits, lockout, password, TOTP.
 *   3. A server-side session in D1, 30 minutes idle and 8 hours absolute, revocable from /admin/security.
 */

// __Host-: the browser only accepts it with Secure, Path=/ and no Domain, so no subdomain can set or shadow it.
export const SESSION_COOKIE = "__Host-fsy_admin"
export const IDLE_MS = 30 * 60 * 1000
export const ABSOLUTE_MS = 8 * 60 * 60 * 1000

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
  const cfg = {
    passwordHash: env.ADMIN_PASSWORD_HASH ?? "",
    totpSecret: env.ADMIN_TOTP_SECRET ?? "",
    turnstileSiteKey: env.TURNSTILE_SITE_KEY ?? "",
    turnstileSecret: env.TURNSTILE_SECRET_KEY ?? "",
  }
  const missing = [
    !cfg.passwordHash.startsWith("pbkdf2-sha256:") && "ADMIN_PASSWORD_HASH",
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
    .prepare("select id_hash, created_at, last_seen, expires_at, ip, access_email from admin_sessions where id_hash = ? and expires_at > ? and last_seen > ?")
    .bind(id, now, now - IDLE_MS)
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
