"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { useMessages } from "@/components/messages-provider"

// The dialog, cmdk and the index load on first use, never with the page.
const SearchDialog = dynamic(() => import("@/components/search-dialog"), { ssr: false })

/** The search trigger: a plate with a magnifier on a phone, a field on a wide screen. Ctrl K or ⌘K opens it anywhere. */
export function SiteSearch() {
  const m = useMessages()
  const [open, setOpen] = useState(false)
  const [used, setUsed] = useState(false)
  const show = () => {
    setUsed(true)
    setOpen(true)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setUsed(true)
        setOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-label={m.nav.search}
        className="grid size-11 place-items-center rounded-lg bg-card text-primary shadow-[inset_0_0_0_2px_var(--primary)] lg:hidden"
      >
        <Search className="size-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={show}
        className="hidden h-11 w-80 items-center gap-2 rounded-lg bg-background px-3 text-start text-sm text-muted-foreground shadow-[inset_0_0_0_2px_var(--border)] transition-shadow hover:shadow-[inset_0_0_0_2px_var(--input)] lg:flex"
      >
        <Search className="size-4 shrink-0" aria-hidden="true" />
        <span className="flex-1 truncate">{m.nav.searchHint}</span>
        <kbd dir="ltr" className="rounded-md bg-card px-1.5 py-0.5 text-[11px] font-semibold shadow-[inset_0_0_0_1px_var(--border)]">
          Ctrl K
        </kbd>
      </button>
      {used && <SearchDialog open={open} onOpenChange={setOpen} />}
    </>
  )
}
