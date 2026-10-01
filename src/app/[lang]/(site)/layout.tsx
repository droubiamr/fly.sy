/**
 * The reading column most pages sit in. It also owns not-found.tsx: a not-found
 * boundary at the root layout's own level is rendered without that layout's
 * html and body; one level down, it is rendered inside them, in the right
 * language and direction. The route pages and home, which run edge to edge,
 * live in the (wide) group beside this one.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-2xl px-5 pt-5">{children}</div>
}
