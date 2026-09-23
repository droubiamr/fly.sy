/**
 * A pass-through segment whose only job is to own not-found.tsx. A not-found
 * boundary at the root layout's own level is rendered without that layout's
 * html and body; one level down, it is rendered inside them, in the right
 * language and direction.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return children
}
