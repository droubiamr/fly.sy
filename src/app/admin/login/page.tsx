import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { adminPassword, isAdmin } from "@/lib/admin-auth"
import { LoginForm } from "../_components/login-form"

export const dynamic = "force-dynamic"

export const metadata: Metadata = { title: "Sign in" }

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin")
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-6 sm:p-8">
        <p dir="ltr" className="text-[22px] font-bold tracking-tight">
          fly<span className="text-primary">.sy</span>
        </p>
        <h1 className="mt-1 mb-6 text-sm text-muted-foreground">Admin dashboard</h1>
        <LoginForm enabled={adminPassword() !== null} />
      </div>
    </main>
  )
}
