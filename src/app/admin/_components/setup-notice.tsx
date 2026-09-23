import { DatabaseZap } from "lucide-react"

/** Shown instead of data when the D1 binding is missing or the migrations have not been applied. */
export function SetupNotice({ reason, message }: { reason: "notConfigured" | "error"; message?: string }) {
  return (
    <section className="rounded-xl border bg-card p-5 sm:p-6">
      <div className="mb-3 flex items-center gap-2">
        <DatabaseZap className="size-5 text-primary" aria-hidden="true" />
        <h2 className="font-semibold">{reason === "notConfigured" ? "No database on this deployment" : "The database answered with an error"}</h2>
      </div>
      {message && (
        <p className="mb-4 rounded-lg bg-muted px-3 py-2 font-mono text-xs break-words text-muted-foreground">{message}</p>
      )}
      <ol className="flex list-decimal flex-col gap-2 ps-5 text-sm leading-relaxed">
        <li>
          Create the database once: <code className="text-[13px]">npx wrangler d1 create fly-sy</code>, and paste the id it prints
          into <code className="text-[13px]">wrangler.jsonc</code>.
        </li>
        <li>
          Apply the migrations: <code className="text-[13px]">npx wrangler d1 migrations apply fly-sy --remote</code> (or{" "}
          <code className="text-[13px]">--local</code> for <code className="text-[13px]">npm run dev</code>).
        </li>
        <li>Deploy again.</li>
      </ol>
    </section>
  )
}
