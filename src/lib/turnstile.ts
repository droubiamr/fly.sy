/**
 * Server-side Turnstile check, as documented at
 * https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 * A token is single-use and valid for 300 seconds. With real keys the answer must also name this host and
 * the form's action, so a token solved on another site or another form is refused.
 */
export const TURNSTILE_ACTION = "admin-login"

// Cloudflare's published testing secrets answer for a dummy host and action, so those two checks are skipped.
const TESTING_SECRET = /^[123]x0{31}AA$/

export async function verifyTurnstile(opts: { secret: string; token: string; ip: string | null; host: string }): Promise<boolean> {
  const { secret, token, ip, host } = opts
  if (!token || token.length > 2048) return false
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: ip ?? undefined, idempotency_key: crypto.randomUUID() }),
      signal: AbortSignal.timeout(8000),
    })
    const out = (await res.json()) as { success?: boolean; hostname?: string; action?: string }
    if (out.success !== true) return false
    if (TESTING_SECRET.test(secret)) return true
    return out.hostname === host && out.action === TURNSTILE_ACTION
  } catch {
    return false
  }
}
