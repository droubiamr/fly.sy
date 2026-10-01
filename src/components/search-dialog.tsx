"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { SearchGroup, SearchItem } from "@/lib/search"
import { useLocale, useMessages } from "@/components/messages-provider"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

const GROUPS: SearchGroup[] = ["countries", "airports", "crossings", "airlines", "pages"]

/** The site search: shadcn's Command (cmdk) in a dialog, over the index for this language. */
export default function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const locale = useLocale()
  const m = useMessages()
  const router = useRouter()
  const [items, setItems] = useState<SearchItem[] | null>(null)

  useEffect(() => {
    let live = true
    fetch(`/api/search/${locale}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((x: SearchItem[]) => live && setItems(x))
      .catch(() => live && setItems([]))
    return () => {
      live = false
    }
  }, [locale])

  const go = (href: string) => {
    onOpenChange(false)
    router.push(href)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title={m.nav.search} description={m.nav.searchHint}>
      <CommandInput placeholder={m.nav.searchHint} />
      <CommandList className="max-h-[min(60vh,420px)]">
        <CommandEmpty>{items ? m.nav.searchEmpty : m.nav.searchLoading}</CommandEmpty>
        {items &&
          GROUPS.map((g) => (
            <CommandGroup key={g} heading={m.nav.groups[g]}>
              {items
                .filter((i) => i.group === g)
                .map((i) => (
                  <CommandItem key={i.href} value={`${i.label} ${i.keywords}`} onSelect={() => go(i.href)} className="min-h-11">
                    <span className="font-medium">{i.label}</span>
                    {i.sub && <span className="ms-auto text-xs text-muted-foreground">{i.sub}</span>}
                  </CommandItem>
                ))}
            </CommandGroup>
          ))}
      </CommandList>
    </CommandDialog>
  )
}
