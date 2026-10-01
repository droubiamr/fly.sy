import { DATA_FILES, dataFile, isDataFile } from "@/lib/open-data"

// One JSON file per data/ file, written at build time. Any other name is a 404.
export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return DATA_FILES.map((f) => ({ file: `${f.id}.json` }))
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const id = (await params).file.replace(/\.json$/, "")
  if (!isDataFile(id)) return new Response("Not found", { status: 404 })
  return Response.json(dataFile(id), {
    // Readable from any site or tool; kept out of search results, which the pages already cover.
    headers: { "Access-Control-Allow-Origin": "*", "X-Robots-Tag": "noindex" },
  })
}
