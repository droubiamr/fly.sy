import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { accessIdentity, authConfig, currentAdmin } from "@/lib/admin-auth"
import { TURNSTILE_ACTION } from "@/lib/turnstile"
import { LoginForm } from "../_components/login-form"

export const dynamic = "force-dynamic"

export const metadata: Metadata = { title: "Sign in" }

export default async function LoginPage() {
  if (await currentAdmin()) redirect("/admin")
  // Behind Cloudflare Access this page is unreachable without an Access login; if a request gets here anyway,
  // it learns nothing, not even that there is a form.
  if (!(await accessIdentity()).ok) notFound()
  const cfg = authConfig()
  const nonce = (await headers()).get("x-nonce") ?? undefined

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      {/* Explicit rendering: the form mounts the widget itself, so React owns the DOM around it. */}
      <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async nonce={nonce} />
      <div className="w-full max-w-sm rounded-2xl border bg-card p-6 sm:p-8">
        <p dir="ltr" className="text-[22px] font-bold tracking-tight">
          fly<span className="text-primary">.sy</span>
        </p>
        <h1 className="mt-1 mb-6 text-sm text-muted-foreground">Admin dashboard</h1>
        <LoginForm enabled={cfg.missing.length === 0} siteKey={cfg.turnstileSiteKey} action={TURNSTILE_ACTION} />
      </div>
    </main>
  )
}
