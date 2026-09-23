import { DatabaseZap } from "lucide-react"

/** Shown instead of data while the deployment has no service-role key, or the migration has not been run. */
export function SetupNotice({ reason, message }: { reason: "notConfigured" | "error"; message?: string }) {
  return (
    <section className="rounded-xl border bg-card p-5 sm:p-6">
      <div className="mb-3 flex items-center gap-2">
        <DatabaseZap className="size-5 text-primary" aria-hidden="true" />
        <h2 className="font-semibold">{reason === "notConfigured" ? "Connect the database" : "The database answered with an error"}</h2>
      </div>
      {message && (
        <p className="mb-4 rounded-lg bg-muted px-3 py-2 font-mono text-xs break-words text-muted-foreground">{message}</p>
      )}
      <ol className="flex list-decimal flex-col gap-2 ps-5 text-sm leading-relaxed">
        <li>
          In Supabase, open the SQL editor and run <code className="text-[13px]">supabase/migrations/0001_reports.sql</code>, then{" "}
          <code className="text-[13px]">0002_analytics.sql</code>.
        </li>
        <li>
          Copy the <strong>service_role</strong> key from Project Settings → API. It bypasses row-level security, so it is a
          secret: never give it a <code className="text-[13px]">NEXT_PUBLIC_</code> name.
        </li>
        <li>
          Locally, add <code className="text-[13px]">SUPABASE_SERVICE_ROLE_KEY=…</code> to <code className="text-[13px]">.env.local</code>. On
          Cloudflare, run <code className="text-[13px]">npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY</code>.
        </li>
      </ol>
    </section>
  )
}
