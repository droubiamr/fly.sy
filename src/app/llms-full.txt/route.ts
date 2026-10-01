import { llmsFull } from "@/lib/llms"

// Every fact on the site in one file; see llms.txt/route.ts.
export const dynamic = "force-static"

export function GET() {
  return new Response(llmsFull(), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex" },
  })
}
