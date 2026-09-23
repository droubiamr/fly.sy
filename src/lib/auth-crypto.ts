import { Secret, TOTP } from "otpauth"

/**
 * The cryptography behind admin sign-in. Web Crypto only (plus otpauth's pure-JS HMAC for TOTP), so the same
 * code runs in the Worker, in Node and in the tests. No framework imports.
 */

const enc = new TextEncoder()

export function b64url(bytes: Uint8Array): string {
  let s = ""
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}
function fromB64url(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"))
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

/** Equality in time independent of where the inputs differ: both are MACed under a fresh random key first. */
export async function safeEqual(a: string, b: string): Promise<boolean> {
  const key = await crypto.subtle.importKey("raw", crypto.getRandomValues(new Uint8Array(32)), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  const [x, y] = await Promise.all([crypto.subtle.sign("HMAC", key, enc.encode(a)), crypto.subtle.sign("HMAC", key, enc.encode(b))])
  const u = new Uint8Array(x)
  const v = new Uint8Array(y)
  let diff = 0
  for (let i = 0; i < u.length; i++) diff |= u[i] ^ v[i]
  return diff === 0
}

// ——— Passwords ———
// PBKDF2-HMAC-SHA256. OWASP asks for 600,000 iterations, but Cloudflare Workers refuse more than 100,000
// (workerd issue #1346), so 100,000 it is; Cloudflare Access and TOTP in front make up the difference.
// The stored string names its algorithm and cost so both can be raised later without breaking old hashes.

export const PBKDF2_ITERATIONS = 100_000
const PREFIX = "pbkdf2-sha256"

async function pbkdf2(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", enc.encode(password.normalize("NFKC")), "PBKDF2", false, ["deriveBits"])
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256))
}

/** `pbkdf2-sha256:100000:<salt>:<hash>`, base64url, 16-byte random salt. Colons, not the PHC `$`, because
 *  `$` is expanded by .env loaders and shells and would silently corrupt the value. */
export async function hashPassword(password: string, iterations = PBKDF2_ITERATIONS): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return `${PREFIX}:${iterations}:${b64url(salt)}:${b64url(await pbkdf2(password, salt, iterations))}`
}

/** Always does the full PBKDF2 work, even for a malformed hash, so timing says nothing about why it failed. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const m = stored.match(/^pbkdf2-sha256:(\d{4,6}):([A-Za-z0-9_-]{16,}):([A-Za-z0-9_-]{43})$/)
  const iterations = m ? Math.min(Number(m[1]), PBKDF2_ITERATIONS) : PBKDF2_ITERATIONS
  const salt = m ? fromB64url(m[2]) : new Uint8Array(16)
  const got = b64url(await pbkdf2(password.slice(0, 256), salt, iterations))
  return (await safeEqual(got, m ? m[3] : "")) && m !== null
}

// ——— Session tokens ———

/** 256 bits from the CSPRNG, for the cookie. Meaningless on its own: the session lives in D1. */
export const newSessionToken = () => b64url(crypto.getRandomValues(new Uint8Array(32)))

/** What D1 stores for a token: its SHA-256, hex. */
export async function tokenHash(token: string): Promise<string> {
  const d = new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(token)))
  return Array.from(d, (b) => b.toString(16).padStart(2, "0")).join("")
}

// ——— TOTP (RFC 6238): 6 digits, 30 s, SHA-1, the settings every authenticator app supports ———

export function totpFor(secretBase32: string) {
  return new TOTP({ issuer: "fly.sy", label: "admin", algorithm: "SHA1", digits: 6, period: 30, secret: Secret.fromBase32(secretBase32) })
}

/**
 * The time step a code belongs to, allowing one step of clock drift either way, or null if it is wrong.
 * The caller must also refuse a step it has already accepted (see admin_state.totp_step), so a code seen
 * over someone's shoulder cannot be used again.
 */
export function totpStep(secretBase32: string, code: string, now = Date.now()): number | null {
  if (!/^\d{6}$/.test(code)) return null
  let totp: TOTP
  try {
    totp = totpFor(secretBase32)
  } catch {
    return null
  }
  const delta = totp.validate({ token: code, timestamp: now, window: 1 })
  return delta === null ? null : Math.floor(now / 1000 / 30) + delta
}

export const newTotpSecret = () => new Secret({ size: 20 }).base32
