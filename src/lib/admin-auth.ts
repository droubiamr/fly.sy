import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ADMIN_COOKIE, verifySession } from "./admin-token"

/** The admin area is off entirely until ADMIN_PASSWORD is set. Twelve characters is the floor. */
export function adminPassword(): string | null {
  const pw = process.env.ADMIN_PASSWORD
  return pw && pw.length >= 12 ? pw : null
}

export async function isAdmin(): Promise<boolean> {
  // Cookies first, unconditionally: reading them is what makes a page dynamic. Returning before it when the
  // password is missing (as it is at build time) would let Next prerender the redirect as a static page.
  const token = (await cookies()).get(ADMIN_COOKIE)?.value
  const pw = adminPassword()
  return pw ? verifySession(pw, token) : false
}

/** For every admin page and every admin Server Action: a Server Action is a public endpoint, so each one checks. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login")
}
