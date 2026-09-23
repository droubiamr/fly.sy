import { createClient } from "@supabase/supabase-js"

/**
 * Service-role client: bypasses RLS, so it reads visitor analytics and every report, contact field included.
 * Server only. Never import this from a client component, and never give the key a NEXT_PUBLIC_ name.
 * Null when SUPABASE_SERVICE_ROLE_KEY is not set, in which case tracking is a no-op and the dashboard says so.
 */
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
