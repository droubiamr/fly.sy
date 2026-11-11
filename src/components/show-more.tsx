"use client"

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * A long list shown a batch at a time: the first few items, then a button that reveals the next batch. Every
 * item is in the HTML (the page is prerendered, and search engines read it whole); the ones past the fold carry
 * `hidden`, so the browser lays out and fetches the pictures of only what is on screen. A link to an item further
 * down (`#id`) reveals the list up to it.
 */
export function ShowMore({
  items,
  initial,
  step,
  label,
  className,
  itemClassName,
}: {
  items: { id: string; node: ReactNode }[]
  initial: number
  step: number
  label: string
  className?: string
  itemClassName?: string
}) {
  const [opened, setOpened] = useState(initial)
  const hash = useSyncExternalStore(onHashChange, readHash, () => "")

  // A shared link to an item below the fold reveals the list up to it; the HTML (and the hydrating render) shows
  // the first batch only, so what the server sent is what the browser first paints.
  const linked = items.findIndex((x) => x.id === hash)
  const shown = Math.max(opened, linked >= initial ? initial + Math.ceil((linked + 1 - initial) / step) * step : 0)

  // The browser jumped to the hash before the item was shown, so take it there once it is.
  useEffect(() => {
    if (linked >= initial) document.getElementById(hash)?.scrollIntoView({ block: "start" })
  }, [hash, linked, initial])

  // After a press, move to the first new item: the reader's place in the list, and the screen reader's.
  const next = useRef<string | null>(null)
  useEffect(() => {
    if (!next.current) return
    document.getElementById(next.current)?.focus({ preventScroll: true })
    next.current = null
  }, [shown])

  const more = () => {
    next.current = items[shown]?.id ?? null
    setOpened(Math.min(items.length, shown + step))
  }

  return (
    <>
      <ul className={className}>
        {items.map((x, i) => (
          <li key={x.id} id={x.id} hidden={i >= shown} tabIndex={-1} className={itemClassName}>
            {x.node}
          </li>
        ))}
      </ul>
      {shown < items.length && (
        <div className="mt-4 flex justify-center">
          <Button type="button" variant="outline" className="h-11 px-5" onClick={more}>
            {label}
            <ChevronDown aria-hidden="true" />
          </Button>
        </div>
      )}
    </>
  )
}

const readHash = () => decodeURIComponent(window.location.hash.slice(1))
function onHashChange(cb: () => void) {
  window.addEventListener("hashchange", cb)
  return () => window.removeEventListener("hashchange", cb)
}
