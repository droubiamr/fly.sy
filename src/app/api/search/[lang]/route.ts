import { searchIndex } from "@/lib/search"
import { LOCALES, isLocale } from "@/lib/site"

// One small JSON file per language, written at build time. Under /api/, so
// robots.txt keeps crawlers out; the pages themselves are what gets indexed.
export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }))
}

export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) return new Response("Not found", { status: 404 })
  return Response.json(searchIndex(lang))
}
