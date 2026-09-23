"use server"

import { DATA } from "@/lib/data"
import { db } from "@/lib/db"

export type SubmitState = { ok: true } | { ok: false; error: "invalid" | "notConfigured" | "generic" } | null

const ENTRY_IDS = new Set(Object.keys(DATA.entries))
const PASSPORTS = new Set(["sy", "voa", "res"])

export async function submitReport(_prev: SubmitState, form: FormData): Promise<SubmitState> {
  const entry = String(form.get("entry") ?? "")
  const travelled_on = String(form.get("travelled_on") ?? "")
  const passport = String(form.get("passport") ?? "")
  const note = String(form.get("note") ?? "").trim()
  const contact = String(form.get("contact") ?? "").trim() || null
  const waitRaw = String(form.get("wait_minutes") ?? "").trim()
  const wait_minutes = waitRaw === "" ? null : Number(waitRaw)
  const consent = form.get("consent") === "on"

  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(travelled_on) && !Number.isNaN(Date.parse(travelled_on))
  if (
    !ENTRY_IDS.has(entry) ||
    !validDate ||
    !PASSPORTS.has(passport) ||
    note.length < 10 ||
    note.length > 1000 ||
    (wait_minutes !== null && (!Number.isInteger(wait_minutes) || wait_minutes < 0 || wait_minutes > 4320)) ||
    (contact && contact.length > 200) ||
    !consent
  ) {
    return { ok: false, error: "invalid" }
  }

  const d = db()
  if (!d) return { ok: false, error: "notConfigured" }

  try {
    await d
      .prepare(
        "insert into reports (id, created_at, entry, travelled_on, wait_minutes, passport, note, contact) values (?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .bind(crypto.randomUUID(), Date.now(), entry, travelled_on, wait_minutes, passport, note, contact)
      .run()
  } catch (e) {
    console.error("report not saved:", e)
    return { ok: false, error: "generic" }
  }
  return { ok: true }
}
