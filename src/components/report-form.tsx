"use client"

import { useActionState, useState } from "react"
import { DATA } from "@/lib/data"
import type { Passport } from "@/lib/types"
import { submitReport, type SubmitState } from "@/app/[lang]/(site)/reports/actions"
import { useLocale, useMessages } from "@/components/messages-provider"
import { arrow } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Alert, AlertDescription } from "@/components/ui/alert"

const PASSPORTS: Passport[] = ["sy", "voa", "res"]

export function ReportForm({ contactUrl }: { contactUrl: string }) {
  const locale = useLocale()
  const m = useMessages()
  const f = m.reports.form
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitReport, null)
  const [entry, setEntry] = useState<string>("JDE")
  const [passport, setPassport] = useState<Passport>("sy")

  if (state?.ok) {
    return (
      <Alert>
        <AlertDescription className="text-base">{f.done}</AlertDescription>
      </Alert>
    )
  }

  // No database behind this deployment: say so with the contact link instead of a generic error.
  const notConfigured = state?.ok === false && state.error === "notConfigured"
  const errorText =
    state && !state.ok && !notConfigured ? (state.error === "invalid" ? f.errorInvalid : f.errorGeneric) : null

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      {notConfigured && (
        <Alert>
          <AlertDescription>
            {f.notConfigured}{" "}
            <a
              href={contactUrl}
              className="relative inline-flex font-medium underline underline-offset-4 after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']"
            >
              {arrow(locale)}
            </a>
          </AlertDescription>
        </Alert>
      )}

      <fieldset className="flex flex-col gap-2">
        <legend className="text-[13.5px] font-semibold">{f.entry}</legend>
        <input type="hidden" name="entry" value={entry} />
        <ToggleGroup type="single" value={entry} onValueChange={(v) => v && setEntry(v)} className="flex-wrap justify-start gap-2">
          {Object.entries(DATA.entries).map(([id, e]) => (
            <ToggleGroupItem
              key={id}
              value={id}
              className="h-11 rounded-full border-0 bg-muted px-4 text-sm font-medium data-[state=on]:bg-foreground data-[state=on]:text-background"
            >
              {e.name[locale]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="travelled_on">{f.date}</Label>
          <Input id="travelled_on" name="travelled_on" type="date" required className="h-11 rounded-[10px]" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="wait_minutes">{f.wait}</Label>
          <Input id="wait_minutes" name="wait_minutes" type="number" inputMode="numeric" min={0} max={4320} className="h-11 rounded-[10px]" />
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-[13.5px] font-semibold">{f.passport}</legend>
        <input type="hidden" name="passport" value={passport} />
        <ToggleGroup type="single" value={passport} onValueChange={(v) => v && setPassport(v as Passport)} className="grid grid-cols-3 gap-2">
          {PASSPORTS.map((p) => (
            <ToggleGroupItem
              key={p}
              value={p}
              className="h-11 rounded-[10px] border-0 bg-muted text-sm font-medium data-[state=on]:bg-foreground data-[state=on]:text-background"
            >
              {f.passports[p]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </fieldset>

      <div className="flex flex-col gap-2">
        <Label htmlFor="note">{f.note}</Label>
        <Textarea id="note" name="note" required minLength={10} maxLength={1000} rows={4} className="rounded-[10px] text-base leading-relaxed" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="contact">{f.contact}</Label>
        <Input
          id="contact"
          name="contact"
          type="text"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          maxLength={200}
          className="h-11 rounded-[10px]"
        />
      </div>

      <div className="flex items-start gap-3 text-[13px] leading-relaxed text-muted-foreground">
        <input id="consent" name="consent" type="checkbox" required className="mt-0.5 size-6 shrink-0 accent-primary" />
        <Label htmlFor="consent" className="font-normal leading-relaxed">
          {f.consent}
        </Label>
      </div>

      {errorText && (
        <Alert variant="destructive">
          <AlertDescription>{errorText}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" size="lg" disabled={pending} className="h-13 rounded-xl text-[15.5px] shadow-none">
        {pending ? f.sending : f.submit}
      </Button>
    </form>
  )
}
