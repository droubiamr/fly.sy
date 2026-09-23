"use client"

import { useActionState, useEffect, useRef } from "react"
import { LockKeyhole } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login, type LoginState } from "../actions"

type Turnstile = {
  render(el: HTMLElement, opts: Record<string, unknown>): string
  reset(id: string): void
  remove(id: string): void
}
declare global {
  interface Window {
    turnstile?: Turnstile
  }
}

const MESSAGE = {
  failed: "Sign-in failed. Check the password and the code, then try again.",
  locked: "Too many attempts. Try again in 15 minutes.",
  disabled: "Sign-in is switched off on this deployment.",
} as const

export function LoginForm({ enabled, siteKey, action: turnstileAction }: { enabled: boolean; siteKey: string; action: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, null)
  const box = useRef<HTMLDivElement>(null)
  const widget = useRef<string | null>(null)
  const error = !enabled ? "disabled" : state?.error

  // Mount the Turnstile widget once its script has loaded. The widget adds the hidden
  // cf-turnstile-response field to the form itself.
  useEffect(() => {
    if (!enabled || !siteKey) return
    let timer: ReturnType<typeof setTimeout>
    const mount = () => {
      if (!box.current) return
      if (!window.turnstile) {
        timer = setTimeout(mount, 100)
        return
      }
      widget.current = window.turnstile.render(box.current, { sitekey: siteKey, action: turnstileAction, theme: "auto", size: "flexible" })
    }
    mount()
    return () => {
      clearTimeout(timer)
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current)
      widget.current = null
    }
  }, [enabled, siteKey, turnstileAction])

  // A token is single-use: every answer from the server needs a new one.
  useEffect(() => {
    if (state && widget.current && window.turnstile) window.turnstile.reset(widget.current)
  }, [state])

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
          maxLength={256}
          disabled={!enabled}
          className="h-11"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="code">Authenticator code</Label>
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]{6,7}"
          maxLength={7}
          required
          disabled={!enabled}
          className="h-11 tracking-[0.3em] tabular-nums"
        />
      </div>
      <div ref={box} className="min-h-[65px]" />
      {error && (
        <p id="login-error" role="alert" className="text-sm text-destructive">
          {MESSAGE[error]}
        </p>
      )}
      <Button type="submit" disabled={pending || !enabled} className="h-11 rounded-full text-[15px]">
        <LockKeyhole aria-hidden="true" />
        {pending ? "Checking…" : "Sign in"}
      </Button>
    </form>
  )
}
