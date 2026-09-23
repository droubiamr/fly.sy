"use client"

import { flushSync } from "react-dom"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useMessages } from "@/components/messages-provider"
import { Button } from "@/components/ui/button"

/**
 * The sun/moon button, as in Linkat's header: one tap flips light and dark.
 * Until the first tap the site follows the device; a tap pins the opposite
 * and remembers it. Both icons are always in the DOM and the dark: classes
 * swap them, so the icon is right on the first paint, before any script.
 */
export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const m = useMessages()

  function toggle() {
    const next = resolvedTheme === "dark" ? "light" : "dark"
    // The whole page crossfades as one surface where the browser can; older
    // browsers and reduced motion get the plain swap.
    if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTheme(next)
      return
    }
    document.startViewTransition(() => flushSync(() => setTheme(next)))
  }

  return (
    <Button variant="ghost" size="icon-lg" className="relative size-11 rounded-full" aria-label={m.theme} onClick={toggle}>
      <Sun className="size-[1.1rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-[1.1rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </Button>
  )
}
