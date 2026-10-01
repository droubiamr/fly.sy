import { getCloudflareContext } from "@opennextjs/cloudflare"
import type { NextRequest } from "next/server"
import { currentAdmin } from "@/lib/admin-auth"
import { db } from "@/lib/db"
import { trackView, type Cf } from "@/lib/track"

/**
 * Records one page view (see trackView). On Cloudflare, worker.ts answers this itself unless the admin is
 * signed in, so Next only sees it under `next dev` and for the admin, whose own views are not counted.
 */
export async function POST(req: NextRequest) {
  let cf: Cf | undefined
  try {
    cf = (getCloudflareContext().cf ?? {}) as Cf
  } catch {}
  return trackView(req, { db: db(), cf, signedIn: async () => Boolean(await currentAdmin()) })
}
