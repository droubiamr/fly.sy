import { getCloudflareContext } from "@opennextjs/cloudflare"

// The slice of the D1 API this app uses. Declared here rather than taken from `wrangler types`, whose output
// is generated per machine and not committed.
export type D1Result<T> = { results: T[]; meta: { changes?: number } }
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>
  first<T = Record<string, unknown>>(): Promise<T | null>
  run(): Promise<D1Result<unknown>>
}
export interface D1Database {
  prepare(query: string): D1PreparedStatement
  batch<T = Record<string, unknown>>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>
}

/**
 * The D1 binding named DB in wrangler.jsonc. Null where there is no Cloudflare context, which is during the
 * static build; in `next dev` initOpenNextCloudflareForDev() provides a local database.
 */
export function db(): D1Database | null {
  try {
    return ((getCloudflareContext().env as unknown as { DB?: D1Database }).DB ?? null)
  } catch {
    return null
  }
}
