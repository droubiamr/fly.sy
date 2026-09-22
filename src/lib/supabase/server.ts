import { createClient } from "@supabase/supabase-js"

/** Anon-key client for server components and actions. Null when the deployment has no Supabase configured,
 *  so the site still runs (feed falls back to editor-verified seed reports; the form explains itself). */
export function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export const supabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
