import { Info, Landmark, MapPin, MessagesSquare, Plane } from "lucide-react"

/** The five sections, shared by the header nav (desktop) and the dock (phone and iPad). */
export const NAV_ITEMS = [
  { href: "/", key: "plan", Icon: MapPin },
  { href: "/airlines", key: "airlines", Icon: Plane },
  { href: "/crossings", key: "crossings", Icon: Landmark },
  { href: "/reports", key: "reports", Icon: MessagesSquare },
  { href: "/about", key: "about", Icon: Info },
] as const

/** Whether a section owns the current page. Airports and documents live under crossings. */
export function isActive(href: string, path: string) {
  if (href === "/") return path === "/" || path.startsWith("/from/")
  if (href === "/crossings") return path.startsWith("/crossings") || path.startsWith("/airports") || path === "/documents"
  return path.startsWith(href)
}
