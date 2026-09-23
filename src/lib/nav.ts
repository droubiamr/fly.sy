import { MapPin, Plane, Landmark, FileCheck, MessagesSquare, Info } from "lucide-react"

/** The site's sections, in order. One list feeds the header nav, the mobile dock and the sitemap. */
export const NAV = [
  { href: "/", key: "plan", Icon: MapPin },
  { href: "/flights", key: "flights", Icon: Plane },
  { href: "/crossings", key: "crossings", Icon: Landmark },
  { href: "/visa", key: "visa", Icon: FileCheck },
  { href: "/reports", key: "reports", Icon: MessagesSquare },
] as const

export const ABOUT = { href: "/about", key: "about", Icon: Info } as const

export const isActive = (href: string, path: string) => (href === "/" ? path === "/" : path.startsWith(href))
