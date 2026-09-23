"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

/**
 * Light and dark, as on Linkat. next-themes reads the visitor's saved choice
 * (by default their device setting), puts .dark or .light on <html> so the
 * palette in globals.css takes over, and runs a tiny inline script before the
 * first paint so a dark-mode visitor never sees a light flash. That script
 * edits <html> before React does, hence suppressHydrationWarning on it.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
      <ThemeColorSync />
    </NextThemesProvider>
  )
}

/**
 * Keeps the browser chrome in step with a manual override. The layout
 * declares one theme-color per device setting and the browser picks between
 * them; once someone picks Dark on a light phone, both tags must say dark or
 * the address bar stays light. Back on System, each tag gets its value back.
 */
function ThemeColorSync() {
  const { theme, resolvedTheme } = useTheme()
  const pathname = usePathname()

  useEffect(() => {
    const tags = Array.from(document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"][media]'))
    if (tags.length === 0) return
    for (const tag of tags) if (!tag.dataset.original) tag.dataset.original = tag.content
    if (theme === "system" || !resolvedTheme) {
      for (const tag of tags) tag.content = tag.dataset.original!
      return
    }
    const colour = tags.find((t) => t.media.includes(resolvedTheme))?.dataset.original
    if (!colour) return
    for (const tag of tags) tag.content = colour
  }, [theme, resolvedTheme, pathname])

  return null
}
