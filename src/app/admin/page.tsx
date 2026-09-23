import type { Metadata } from "next"
import Link from "next/link"
import { Building2, Compass, Globe2, Languages, Laptop, Link2, MapPin, MonitorSmartphone, Network, ScrollText, Smartphone, X } from "lucide-react"
import { requireAdmin } from "@/lib/admin-auth"
import { getTraffic, pendingCount, type Filter, type RecentView, type Traffic } from "@/lib/admin-data"
import { isRange } from "@/lib/analytics"
import { AdminHeader } from "./_components/admin-header"
import { RANGE_LABEL, RangeFilter } from "./_components/range-filter"
import { SetupNotice } from "./_components/setup-notice"
import { StatTile } from "./_components/stat-tile"
import { TopList } from "./_components/top-list"
import { ViewsChart } from "./_components/views-chart"

export const dynamic = "force-dynamic"

export const metadata: Metadata = { title: "Traffic" }

type Props = { searchParams: Promise<{ range?: string; ip?: string; visitor?: string }> }

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
  const sp = await searchParams
  const range = isRange(sp.range) ? sp.range : "7d"
  // Filters come from links on this page; anything malformed is ignored rather than queried.
  const filter: Filter = {
    ip: sp.ip && /^[0-9a-f.:]{2,45}$/i.test(sp.ip) ? sp.ip : undefined,
    visitor: sp.visitor && /^[0-9a-f-]{36}$/i.test(sp.visitor) ? sp.visitor : undefined,
  }
  const [traffic, pending] = await Promise.all([getTraffic(range, filter), pendingCount()])
  const period = RANGE_LABEL[range]

  return (
    <>
      <AdminHeader active="traffic" pending={pending} />
      <main className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="me-auto text-2xl font-bold tracking-tight">Traffic</h1>
          <RangeFilter current={range} filter={filter} />
        </div>

        {(filter.ip || filter.visitor) && (
          <p className="flex flex-wrap items-center gap-2 text-sm">
            Showing only {filter.ip ? <>IP <code className="font-medium">{filter.ip}</code></> : <>visitor <code className="font-medium">{filter.visitor!.slice(0, 8)}</code></>}
            <Link href={range === "7d" ? "/admin" : `/admin?range=${range}`} className="inline-flex h-11 items-center gap-1 rounded-full px-3 text-muted-foreground hover:text-foreground">
              <X className="size-4" aria-hidden="true" /> Clear
            </Link>
          </p>
        )}

        {!traffic.ok ? (
          <SetupNotice reason={traffic.reason} message={traffic.message} />
        ) : (
          <Dashboard traffic={traffic} period={period} range={range} />
        )}
      </main>
    </>
  )
}

function Dashboard({ traffic, period, range }: { traffic: Extract<Traffic, { ok: true }>; period: string; range: string }) {
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
      <p className="-mt-2 text-xs text-muted-foreground">
        {nf.format(c.ips)} distinct IP addresses in the last {period}.
      </p>

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
        <TopList title="Cities" Icon={MapPin} rows={c.cities} total={c.views} />
        <TopList title="Networks" Icon={Building2} rows={c.networks} total={c.views} empty="Cloudflare names the network in production only." />
        <TopList
          title="IP addresses"
          Icon={Network}
          rows={c.ipRows}
          total={c.views}
          href={(k) => `/admin?${new URLSearchParams({ ...(range === "7d" ? {} : { range }), ip: k })}`}
          external={false}
        />
        <TopList title="Devices" Icon={MonitorSmartphone} rows={c.devices} total={c.views} label={capital} />
        <TopList title="Browsers" Icon={Compass} rows={c.browsers} total={c.views} />
        <TopList title="Operating systems" Icon={Laptop} rows={c.os} total={c.views} />
        <TopList title="Languages" Icon={Languages} rows={c.locales} total={c.views} label={(k) => LOCALE_NAME[k] ?? k} />
        <Recent rows={recent} range={range} />
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

function Recent({ rows, range }: { rows: RecentView[]; range: string }) {
  const filterHref = (key: "ip" | "visitor", value: string) =>
    `/admin?${new URLSearchParams({ ...(range === "7d" ? {} : { range }), [key]: value })}`
  return (
    <section className="flex min-w-0 flex-col rounded-xl border bg-card p-4 md:col-span-2" aria-labelledby="recent-title">
      <div className="mb-3 flex items-center gap-2">
        <Smartphone className="size-4 text-muted-foreground" aria-hidden="true" />
        <h2 id="recent-title" className="text-sm font-semibold">
          Latest views
        </h2>
        <span className="ms-auto text-xs text-muted-foreground">UTC · hover a device for the full user agent</span>
      </div>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Nothing yet.</p>
      ) : (
        <div className="-mx-4 overflow-x-auto px-4">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="py-2 pe-3 text-start font-medium">When</th>
                <th scope="col" className="py-2 pe-3 text-start font-medium">Page</th>
                <th scope="col" className="py-2 pe-3 text-start font-medium">Source</th>
                <th scope="col" className="py-2 pe-3 text-start font-medium">IP</th>
                <th scope="col" className="py-2 pe-3 text-start font-medium">Location</th>
                <th scope="col" className="py-2 pe-3 text-start font-medium">Network</th>
                <th scope="col" className="py-2 pe-3 text-start font-medium">Device</th>
                <th scope="col" className="py-2 text-start font-medium">Visitor</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={`${r.ts}-${i}`} className="border-t align-top">
                  <td className="py-2 pe-3 whitespace-nowrap text-muted-foreground tabular-nums">{whenFmt.format(r.ts)}</td>
                  <td className="max-w-48 truncate py-2 pe-3" title={r.path}>
                    {r.path}
                  </td>
                  <td className="max-w-32 truncate py-2 pe-3 text-muted-foreground">{r.source ?? "Direct"}</td>
                  <td className="py-2 pe-3 whitespace-nowrap tabular-nums">
                    {r.ip ? (
                      <Link href={filterHref("ip", r.ip)} className="hover:underline">
                        {r.ip}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">Unknown</span>
                    )}
                  </td>
                  <td className="max-w-40 truncate py-2 pe-3" title={[r.city, r.region, r.country && country(r.country)].filter(Boolean).join(", ")}>
                    {[r.city, r.country ? country(r.country) : null].filter(Boolean).join(", ") || "Unknown"}
                  </td>
                  <td className="max-w-36 truncate py-2 pe-3 text-muted-foreground" title={r.as_org ?? ""}>
                    {r.as_org ?? ""}
                  </td>
                  <td className="py-2 pe-3 whitespace-nowrap text-muted-foreground" title={r.user_agent ?? ""}>
                    {capital(r.device)}
                    {r.browser ? ` · ${r.browser}` : ""}
                    {r.os ? ` · ${r.os}` : ""}
                  </td>
                  <td className="py-2 whitespace-nowrap">
                    {r.visitor_id ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Link href={filterHref("visitor", r.visitor_id)} className="font-mono text-xs text-muted-foreground hover:underline" title={r.visitor_id}>
                          {r.visitor_id.slice(0, 8)}
                        </Link>
                        {r.new_visitor === 1 && (
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
