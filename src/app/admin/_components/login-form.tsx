"use client"

import { useActionState } from "react"
import { LockKeyhole } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login, type LoginState } from "../actions"

export function LoginForm({ enabled }: { enabled: boolean }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, null)
  const error = !enabled || state?.error === "disabled" ? "disabled" : state?.error

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          disabled={!enabled}
          aria-invalid={error === "wrong" || undefined}
          aria-describedby={error ? "login-error" : undefined}
          className="h-11"
        />
      </div>
      {error && (
        <p id="login-error" role="alert" className="text-sm text-destructive">
          {error === "wrong"
            ? "That password is not right."
            : "Sign-in is off. Set ADMIN_PASSWORD (12 characters or more) in the deployment's secrets."}
        </p>
      )}
      <Button type="submit" disabled={pending || !enabled} className="h-11 rounded-full text-[15px]">
        <LockKeyhole aria-hidden="true" />
        {pending ? "Checking…" : "Sign in"}
      </Button>
    </form>
  )
}
