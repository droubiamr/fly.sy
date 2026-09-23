/**
 * The admin session is a signed expiry, nothing more: `v1.<expires ms>.<HMAC-SHA256>`. The key is derived from
 * ADMIN_PASSWORD, so changing the password signs every existing session out. Web Crypto only, so the same code
 * runs in the Cloudflare Worker, in Node and in the tests.
 */

export const ADMIN_COOKIE = "fsy_admin"
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

const enc = new TextEncoder()

function base64url(buf: ArrayBuffer): string {
  let s = ""
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

async function hmac(key: string, data: string): Promise<string> {
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  return base64url(await crypto.subtle.sign("HMAC", k, enc.encode(data)))
}

const sessionKey = (password: string) => `fly.sy admin session\u0000${password}`

/** Compares two strings in time that does not depend on where they differ: both are MACed under a fresh key first. */
export async function safeEqual(a: string, b: string): Promise<boolean> {
  const key = base64url(crypto.getRandomValues(new Uint8Array(32)).buffer)
  const [x, y] = await Promise.all([hmac(key, a), hmac(key, b)])
  let diff = 0
  for (let i = 0; i < x.length; i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i)
  return diff === 0
}

export async function signSession(password: string, now = Date.now()): Promise<string> {
  const payload = `v1.${now + SESSION_TTL_MS}`
  return `${payload}.${await hmac(sessionKey(password), payload)}`
}

export async function verifySession(password: string, token: string | undefined, now = Date.now()): Promise<boolean> {
  if (!password || !token) return false
  const m = token.match(/^(v1\.(\d{13}))\.([A-Za-z0-9_-]{43})$/)
  if (!m || Number(m[2]) <= now) return false
  return safeEqual(m[3], await hmac(sessionKey(password), m[1]))
}
