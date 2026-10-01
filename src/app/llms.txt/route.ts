import { llmsIndex } from "@/lib/llms"

// Written from data/ at build time, like the sitemap. Kept out of search results
// (it repeats the pages); assistants fetch it directly.
export const dynamic = "force-static"

export function GET() {
  return new Response(llmsIndex(), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex" },
  })
}
