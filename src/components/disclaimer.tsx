"use client"

import { useSyncExternalStore } from "react"
import { ShieldAlert } from "lucide-react"
import { useMessages } from "@/components/messages-provider"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Bump the version when the wording changes in a way every visitor should see
// again. Anyone who accepted an older version gets the popup once more.
const KEY = "flysy.disclaimer"
const VERSION = "1"

// localStorage as an external store. Where storage is blocked (private mode,
// cleared site data) the acceptance is kept in memory instead, so the popup
// still goes away for the rest of the visit and comes back next time.
let inMemory = false
const listeners = new Set<() => void>()

function subscribe(cb: () => void) {
  listeners.add(cb)
  window.addEventListener("storage", cb)
  return () => {
    listeners.delete(cb)
    window.removeEventListener("storage", cb)
  }
}

function accepted(): boolean {
  if (inMemory) return true
  try {
    return localStorage.getItem(KEY) === VERSION
  } catch {
    return false
  }
}

// The server, and the first client render that hydrates it, both say "accepted"
// so the two trees match; the real value takes over straight after.
const acceptedOnServer = () => true

function accept() {
  inMemory = true
  try {
    localStorage.setItem(KEY, VERSION)
  } catch {
    // Kept in memory only; see above.
  }
  for (const cb of listeners) cb()
}

/**
 * The no-liability notice, shown once per browser before anything else is
 * used. An alert dialog rather than a dialog: there is no close button and
 * tapping outside does nothing, so the only way through is the button.
 */
export function Disclaimer() {
  const m = useMessages()
  const open = !useSyncExternalStore(subscribe, accepted, acceptedOnServer)

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <ShieldAlert className="size-6 text-primary" strokeWidth={1.8} aria-hidden="true" />
          <AlertDialogTitle>{m.disclaimer.title}</AlertDialogTitle>
          <AlertDialogDescription className="flex flex-col gap-3">
            {m.disclaimer.body.map((p) => (
              <span key={p} className="block">
                {p}
              </span>
            ))}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={accept} className="h-11 w-full rounded-full text-[15px]">
            {m.disclaimer.accept}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
