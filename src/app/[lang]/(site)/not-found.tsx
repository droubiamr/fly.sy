import Link from "next/link"
import { getMessages } from "@/messages"

/**
 * Bilingual, and styled inline on purpose. With a dynamic [lang] root layout,
 * Next renders a 404 in its own bare document rather than through the layout,
 * so neither the language from the URL nor the site stylesheet is available.
 * The status code is what matters to a crawler; this keeps it readable for a person.
 */
const page = {
  fontFamily: '"Readex Pro", system-ui, sans-serif',
  color: "#1c2a25",
  background: "#f5f6f3",
  minHeight: "100dvh",
  margin: 0,
  padding: "40px 20px",
  display: "flex",
  flexDirection: "column" as const,
  gap: 32,
  maxWidth: 672,
  boxSizing: "border-box" as const,
}
const h = { fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }
const p = { fontSize: 14, color: "#5c6b65", margin: "8px 0 12px", lineHeight: 1.6 }
const a = {
  display: "inline-flex",
  alignItems: "center",
  height: 44,
  padding: "0 16px",
  borderRadius: 8,
  background: "#e8f1ec",
  color: "#0e5c3f",
  fontWeight: 500,
  fontSize: 14,
  textDecoration: "none",
}

export default function NotFound() {
  const ar = getMessages("ar").notFound
  const en = getMessages("en").notFound
  return (
    <div style={page}>
      <Link href="/" dir="ltr" style={{ ...a, background: "none", padding: 0, fontSize: 22, fontWeight: 700, color: "#1c2a25" }}>
        fly<span style={{ color: "#0e5c3f" }}>.sy</span>
      </Link>
      <section lang="ar" dir="rtl">
        <h1 style={h}>{ar.title}</h1>
        <p style={p}>{ar.text}</p>
        <Link href="/" style={a}>
          {ar.home}
        </Link>
      </section>
      <section lang="en" dir="ltr" style={{ borderTop: "1px solid #e3e6e1", paddingTop: 32 }}>
        <p style={{ ...h, fontSize: 20 }}>{en.title}</p>
        <p style={p}>{en.text}</p>
        <Link href="/en" style={a}>
          {en.home}
        </Link>
      </section>
    </div>
  )
}
