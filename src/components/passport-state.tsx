"use client"

import { createContext, useContext, useSyncExternalStore } from "react"
import type { Passport } from "@/lib/types"

export const PASSPORT_PARAM = "p"
const isPassport = (v: string | null): v is Passport => v === "sy" || v === "voa" || v === "res"

// The URL is the store: ?p=voa or ?p=res, nothing for a Syrian passport.
const listeners = new Set<() => void>()
const subscribe = (cb: () => void) => {
  listeners.add(cb)
  window.addEventListener("popstate", cb)
  return () => {
    listeners.delete(cb)
    window.removeEventListener("popstate", cb)
  }
}
const read = (): Passport => {
  const p = new URLSearchParams(window.location.search).get(PASSPORT_PARAM)
  return isPassport(p) ? p : "sy"
}
// The server, and the first client render that hydrates it, both say Syrian.
const readOnServer = (): Passport => "sy"

const Ctx = createContext<{ passport: Passport; setPassport: (p: Passport) => void } | null>(null)

/**
 * Which passport the answer is shown for. The page is static and always
 * rendered for a Syrian passport; on the client the choice is read from ?p=
 * and written back with replaceState, so it survives a share or a refresh but
 * never costs a request. Not useSearchParams: that would push the routes out
 * of the static HTML and into a client render, which is what a crawler reads.
 */
export function PassportProvider({ children }: { children: React.ReactNode }) {
  const passport = useSyncExternalStore(subscribe, read, readOnServer)
  const setPassport = (p: Passport) => {
    const url = new URL(window.location.href)
    if (p === "sy") url.searchParams.delete(PASSPORT_PARAM)
    else url.searchParams.set(PASSPORT_PARAM, p)
    window.history.replaceState(window.history.state, "", url)
    for (const cb of listeners) cb()
  }
  return <Ctx.Provider value={{ passport, setPassport }}>{children}</Ctx.Provider>
}

export function usePassport() {
  const v = useContext(Ctx)
  if (!v) throw new Error("PassportProvider missing")
  return v
}

/** The query to carry the current passport to another page. */
export const passportQuery = (p: Passport) => (p === "sy" ? "" : `?${PASSPORT_PARAM}=${p}`)
