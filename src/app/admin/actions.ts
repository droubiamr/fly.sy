"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { adminPassword, requireAdmin } from "@/lib/admin-auth"
import { ADMIN_COOKIE, SESSION_TTL_MS, safeEqual, signSession } from "@/lib/admin-token"
import { supabaseAdmin } from "@/lib/supabase/admin"

export type LoginState = { error: "wrong" | "disabled" } | null

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const pw = adminPassword()
  if (!pw) return { error: "disabled" }
  const given = String(form.get("password") ?? "")
  if (!(await safeEqual(given, pw))) {
    // No KV store to count attempts in, so every miss costs a second instead.
    await new Promise((r) => setTimeout(r, 1000))
    return { error: "wrong" }
  }
  const jar = await cookies()
  jar.set(ADMIN_COOKIE, await signSession(pw), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  })
  redirect("/admin")
}

export async function logout() {
  const jar = await cookies()
  jar.delete(ADMIN_COOKIE)
  redirect("/admin/login")
}

const DECISIONS = { publish: "published", reject: "rejected", pending: "pending" } as const

/** Moves one community report between pending, published and rejected. */
export async function moderate(form: FormData) {
  await requireAdmin()
  const id = String(form.get("id") ?? "")
  const decision = String(form.get("decision") ?? "")
  if (!Object.hasOwn(DECISIONS, decision) || !/^[0-9a-f-]{36}$/i.test(id)) return
  const status = DECISIONS[decision as keyof typeof DECISIONS]
  const sb = supabaseAdmin()
  if (!sb) return
  const { error } = await sb
    .from("reports")
    .update({
      status,
      reviewed_by: status === "pending" ? null : "admin",
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", id)
  if (error) console.error("report not updated:", error.message)
  revalidatePath("/admin/reports")
}
