import type { Metadata } from "next"
import { Compass, Globe2, Languages, Laptop, Link2, MonitorSmartphone, ScrollText, Smartphone } from "lucide-react"
import { requireAdmin } from "@/lib/admin-auth"
import { getTraffic, pendingCount, type RecentView, type Traffic } from "@/lib/admin-data"
import { isRange } from "@/lib/analytics"
import { AdminHeader } from "./_components/admin-header"
import { RANGE_LABEL, RangeFilter } from "./_components/range-filter"
import { SetupNotice } from "./_components/setup-notice"
import { StatTile } from "./_components/stat-tile"
import { TopList } from "./_components/top-list"
import { ViewsChart } from "./_components/views-chart"

export const dynamic = "force-dynamic"

export const metadata: Metadata = { title: "Traffic" }

type Props = { searchParams: Promise<{ range?: string }> }

const regionName = new Intl.DisplayNames(["en"], { type: "region" })
const country = (code: string) => {
  try {
    return regionName.of(code) ?? code
  } catch {
    return code
  }
}
const LOCALE_NAME: Record<string, string> = { ar: "Arabic", en: "English" }
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const whenFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
})
const nf = new Intl.NumberFormat("en-GB")

export default async function TrafficPage({ searchParams }: Props) {
  await requireAdmin()
  const { range: raw } = await searchParams
  const range = isRange(raw) ? raw : "7d"
  const [traffic, pending] = await Promise.all([getTraffic(range), pendingCount()])
  const period = RANGE_LABEL[range]

  return (
    <>
      <AdminHeader active="traffic" pending={pending} />
      <main className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="me-auto text-2xl font-bold tracking-tight">Traffic</h1>
          <RangeFilter current={range} />
        </div>

        {!traffic.ok ? (
          <SetupNotice reason={traffic.reason} message={traffic.message} />
        ) : (
          <Dashboard traffic={traffic} period={period} />
        )}
      </main>
    </>
  )
}

function Dashboard({ traffic, period }: { traffic: Extract<Traffic, { ok: true }>; period: string }) {
  const { current: c, previous: p, bucket, recent } = traffic
  const returning = c.visitors - c.new_visitors
  const perVisitor = c.visitors ? (c.views - c.no_cookie) / c.visitors : 0
  const prevPerVisitor = p.visitors ? (p.views - p.no_cookie) / p.visitors : 0

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Page views" value={c.views} previous={p.views} period={period} />
        <StatTile label="Visitors" value={c.visitors} previous={p.visitors} period={period} />
        <StatTile
          label="Returning visitors"
          value={returning}
          previous={p.visitors - p.new_visitors}
          period={period}
          hint={c.visitors ? `${Math.round((returning / c.visitors) * 100)}% of visitors had been here before` : undefined}
        />
        <StatTile label="Views per visitor" value={perVisitor} previous={prevPerVisitor} period={period} format="ratio" />
      </div>

      <section className="rounded-xl border bg-card p-4 sm:p-5" aria-labelledby="views-title">
        <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 id="views-title" className="font-semibold">
            Page views
          </h2>
          <p className="text-xs text-muted-foreground">per {bucket}, last {period}, UTC</p>
        </div>
        <ViewsChart points={c.series} bucket={bucket} />
      </section>

      {/* grid-cols-1 is minmax(0, 1fr): without it the one mobile column grows to the table's width. */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <TopList title="Pages" Icon={ScrollText} rows={c.pages} total={c.views} href={(k) => k} />
        <TopList
          title="Sources"
          Icon={Link2}
          rows={c.sources}
          total={c.views}
          href={(k) => (k.includes(".") ? `https://${k}` : undefined)}
          empty="No referrals yet. Direct visits and links from the site itself are not a source."
        />
        <TopList title="Countries" Icon={Globe2} rows={c.countries} total={c.views} label={country} />
        <TopList title="Devices" Icon={MonitorSmartphone} rows={c.devices} total={c.views} label={capital} />
        <TopList title="Browsers" Icon={Compass} rows={c.browsers} total={c.views} />
        <TopList title="Operating systems" Icon={Laptop} rows={c.os} total={c.views} />
        <TopList title="Languages" Icon={Languages} rows={c.locales} total={c.views} label={(k) => LOCALE_NAME[k] ?? k} />
        <Recent rows={recent} />
      </div>

      {c.no_cookie > 0 && (
        <p className="text-xs text-muted-foreground">
          {nf.format(c.no_cookie)} of these views came from browsers that sent Global Privacy Control. They count as page views
          but carry no visitor id, so they are left out of the visitor figures.
        </p>
      )}
    </>
  )
}

function Recent({ rows }: { rows: RecentView[] }) {
  return (
    <section className="flex min-w-0 flex-col rounded-xl border bg-card p-4 md:col-span-2" aria-labelledby="recent-title">
      <div className="mb-3 flex items-center gap-2">
        <Smartphone className="size-4 text-muted-foreground" aria-hidden="true" />
        <h2 id="recent-title" className="text-sm font-semibold">
          Latest views
        </h2>
        <span className="ms-auto text-xs text-muted-foreground">UTC</span>
      </div>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Nothing yet.</p>
      ) : (
        <div className="-mx-4 overflow-x-auto px-4">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="py-2 pe-3 text-start font-medium">When</th>
                <th scope="col" className="py-2 pe-3 text-start font-medium">Page</th>
                <th scope="col" className="py-2 pe-3 text-start font-medium">Source</th>
                <th scope="col" className="py-2 pe-3 text-start font-medium">Country</th>
                <th scope="col" className="py-2 pe-3 text-start font-medium">Device</th>
                <th scope="col" className="py-2 text-start font-medium">Visitor</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={`${r.created_at}-${i}`} className="border-t align-top">
                  <td className="py-2 pe-3 whitespace-nowrap text-muted-foreground tabular-nums">{whenFmt.format(new Date(r.created_at))}</td>
                  <td className="max-w-56 truncate py-2 pe-3" title={r.path}>
                    {r.path}
                  </td>
                  <td className="max-w-40 truncate py-2 pe-3 text-muted-foreground">{r.source ?? "Direct"}</td>
                  <td className="py-2 pe-3 whitespace-nowrap">{r.country ? country(r.country) : "Unknown"}</td>
                  <td className="py-2 pe-3 whitespace-nowrap text-muted-foreground">
                    {capital(r.device)}
                    {r.browser ? ` · ${r.browser}` : ""}
                    {r.os ? ` · ${r.os}` : ""}
                  </td>
                  <td className="py-2 whitespace-nowrap">
                    {r.visitor_id ? (
                      <span className="inline-flex items-center gap-1.5">
                        <code className="text-xs text-muted-foreground" title={r.visitor_id}>
                          {r.visitor_id.slice(0, 8)}
                        </code>
                        {r.new_visitor && (
                          <span className="rounded-md border-[1.5px] border-status-open px-1.5 text-[10px] font-bold tracking-wide text-status-open">
                            NEW
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">No cookie</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
