import Link from "next/link"
import { Car, ChevronDown, Plane } from "lucide-react"
import { DATA, airlinePath, cityById, entryPath } from "@/lib/data"
import { fmt, getI18n } from "@/lib/i18n"
import { arrow, formatDuration } from "@/lib/format"
import type { Journey, Way } from "@/lib/plan"
import { localePath } from "@/lib/site"
import type { Locale, Mode, Status } from "@/lib/types"
import type { Messages } from "@/messages"
import { cn } from "@/lib/utils"
import { StatusStamp } from "@/components/status-stamp"
import { AirlineLogo } from "@/components/airline-logo"
import { WayGate } from "@/components/passport-ui"
import { Provenance } from "@/components/provenance"
import { ModeIcons, signClass } from "@/components/sign"

/*
 * The ways into Syria for one route page, one road sign each, fastest first;
 * or, on a leaving page (`out`), the ways out, with the road to the border or
 * the airport before the flight. Rendered on the server, for a Syrian passport;
 * WayGate moves a Syrians-only crossing to the end for any other passport on the
 * way in. Leaving pages have no passport choice: the crossing's own plate says
 * who may use it. Each sign opens on its board of journeys, and each journey on
 * its note, source and check date. Closed <details> keep their text in the HTML,
 * so search engines and assistants read every line even when a visitor sees only the signs.
 */
export function WaySigns({ ways, dest, locale, out = false }: { ways: Way[]; dest: string; locale: Locale; out?: boolean }) {
  const { m } = getI18n(locale)
  const main = Math.max(0, ways.findIndex((w) => w.best))
  return (
    <ol className="flex flex-col gap-3">
      {ways.map((w, i) => (
        <WayGate key={w.entry} syriansOnly={!out && Boolean(w.journeys[0].entryData.syriansOnly)}>
          <WaySign way={w} main={i === main} dest={dest} locale={locale} m={m} out={out} />
        </WayGate>
      ))}
    </ol>
  )
}

const uniq = <T,>(xs: T[]) => [...new Set(xs)]
const span = (hs: number[], locale: Locale) => {
  const lo = Math.min(...hs)
  const hi = Math.max(...hs)
  return lo === hi ? formatDuration(lo, locale) : `${formatDuration(lo, locale)} – ${formatDuration(hi, locale)}`
}
const running = (j: Journey) => j.status === "open" || j.status === "caution"

/** A plate hung under a sign: white, with the colour of what it warns about. */
function Plate({ tone, className, children }: { tone: "caution" | "closed" | "unknown"; className?: string; children: React.ReactNode }) {
  const t = { caution: "text-status-caution", closed: "text-status-closed", unknown: "text-status-unknown" }[tone]
  return <span className={cn("inline-block rounded-md bg-card px-2 py-0.5 text-xs font-bold", t, className)}>{children}</span>
}

function WaySign({ way: w, main, dest, locale, m, out }: { way: Way; main: boolean; dest: string; locale: Locale; m: Messages; out: boolean }) {
  const e = w.journeys[0].entryData
  const city = cityById(dest)!.name[locale]
  // In the order you travel them: fly then drive coming in, drive then fly going out.
  const fly: Mode[] = w.fly ? ["air"] : []
  const drive: Mode[] = w.drive ? ["land"] : []
  const modes = out ? [...drive, ...fly] : [...fly, ...drive]
  const title = w.mode === "air" && w.drive ? fmt(out ? m.way.roadThen : m.way.thenRoad, { entry: e.name[locale] }) : e.name[locale]
  const live = w.journeys.filter(running)
  const timed = live.length ? live : w.journeys
  const road = w.journeys[0].roadHours
  const airlines = uniq([...live, ...w.journeys].map((j) => j.airline).filter((a): a is string => Boolean(a)))
  const status: Status = w.status
  const size = main ? "text-xl sm:text-2xl" : "text-lg"
  const leg = "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,currentColor_75%,transparent)]"
  const crossLeg = (
    <span key="cross" className={leg}>
      {fmt(w.mode === "air" ? m.way.flyLeg : out ? m.way.borderFrom : m.way.borderLeg, { time: span(timed.map((j) => j.hours), locale) })}
    </span>
  )
  const roadLeg =
    road != null && road > 0 ? (
      <span key="road" className={leg}>
        <Car className="size-4" aria-hidden="true" />
        {fmt(out ? m.way.roadFrom : m.way.roadLeg, { time: formatDuration(road, locale), city })}
      </span>
    ) : null

  return (
    <details open={main} className="group/d">
      <summary className={cn(signClass(status === "closed"), "block cursor-pointer list-none p-4 [&::-webkit-details-marker]:hidden")}>
        <span className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <ModeIcons modes={modes} size={main ? "lg" : "md"} />
          <span className="block min-w-0">
            <span className={cn("block leading-tight font-bold", size)}>{title}</span>
            <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] opacity-90">
              {main && w.best && (
                <span className="rounded-md bg-primary-foreground px-2 py-0.5 text-xs font-bold text-primary group-data-[blocked]/way:hidden">
                  {m.way.fastest}
                </span>
              )}
              <span>
                {w.mode === "air"
                  ? fmt(m.way.flights, { n: w.journeys.length })
                  : fmt(out ? m.way.to : m.way.from, { cities: uniq(w.journeys.map((j) => j.city[locale])).join(locale === "ar" ? "، " : ", ") })}
              </span>
            </span>
          </span>
          <span className="flex flex-col items-end gap-1">
            <span className={cn("block font-bold whitespace-nowrap tabular-nums", size)}>{w.best ? formatDuration(w.best.totalHours, locale) : "—"}</span>
            <ChevronDown className="size-4 opacity-80 transition-transform duration-200 group-open/d:rotate-180" aria-hidden="true" />
          </span>
        </span>

        {(e.syriansOnly || status !== "open") && (
          <span className="mt-3 flex flex-wrap gap-2">
            {e.syriansOnly && <Plate tone="caution">{m.way.syriansOnly}</Plate>}
            {e.syriansOnly && <Plate tone="closed" className="hidden group-data-[blocked]/way:inline-block">{m.blocked}</Plate>}
            {status !== "open" && <Plate tone={status}>{m.status[status]}</Plate>}
          </span>
        )}

        {main && (
          <>
            <span className="mt-3 flex flex-wrap gap-2 text-[13px] font-semibold">
              {/* The legs in the order you travel them: the road comes first on the way out. */}
              {out ? [roadLeg, crossLeg] : [crossLeg, roadLeg]}
            </span>
            {airlines.length > 0 && (
              <span className="mt-3 flex items-center gap-1.5 border-t-2 border-primary-foreground/70 pt-3">
                {airlines.slice(0, 6).map((a) => (
                  <span key={a} className="size-8 rounded-md bg-white p-1">
                    <AirlineLogo code={a} />
                  </span>
                ))}
                {airlines.length > 6 && <span className="text-xs font-semibold">+{airlines.length - 6}</span>}
              </span>
            )}
          </>
        )}
      </summary>
      <Board way={w} dest={dest} locale={locale} m={m} out={out} />
    </details>
  )
}

/** Every journey through one entry point, one line each; a line opens on its note, source and date. */
function Board({ way: w, dest, locale, m, out }: { way: Way; dest: string; locale: Locale; m: Messages; out: boolean }) {
  const e = w.journeys[0].entryData
  const href = (p: string) => localePath(locale, p)
  const city = cityById(dest)!.name[locale]
  return (
    <div className="mt-2 overflow-hidden rounded-[10px] border bg-card">
      <p className="bg-secondary px-4 py-2 text-[13.5px] font-bold text-secondary-foreground">
        {fmt(w.mode === "air" ? (out ? m.way.boardOut : m.way.board) : m.way.boardLand, { entry: e.name[locale] })}
      </p>
      <ul>
        {/* What runs first, fastest first; then what is unconfirmed or closed, so a quick-looking flight nobody has seen never heads the list. */}
        {[...w.journeys.filter(running), ...w.journeys.filter((j) => !running(j))].map((j, i) => {
          const al = j.airline ? DATA.airlines[j.airline] : null
          return (
            <li key={`${j.airline ?? "road"}-${j.city.en}-${i}`} className="border-t">
              <details className="group/f">
                <summary className="grid min-h-12 cursor-pointer list-none grid-cols-[1.75rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2 [&::-webkit-details-marker]:hidden">
                  {j.airline ? (
                    <span className="size-7 rounded-md border bg-white p-0.5">
                      <AirlineLogo code={j.airline} />
                    </span>
                  ) : (
                    // No named carrier: a connection by air, or a drive. Say which.
                    <span className="grid size-7 place-items-center rounded-md bg-secondary text-secondary-foreground">
                      {j.mode === "air" ? <Plane className="size-4" aria-hidden="true" /> : <Car className="size-4" aria-hidden="true" />}
                    </span>
                  )}
                  <span className="min-w-0 text-[14px]">
                    <b className="font-semibold">{al ? al.name[locale] : m.mode[j.mode]}</b> <span className="text-muted-foreground">{j.city[locale]}</span>
                  </span>
                  <span className="flex items-center gap-2 text-[14px] font-semibold tabular-nums">
                    {j.status === "open" ? (
                      <>
                        <span className="size-2 rounded-full bg-status-open" aria-hidden="true" />
                        {formatDuration(j.totalHours, locale)}
                      </>
                    ) : (
                      <StatusStamp status={j.status} label={m.status[j.status]} />
                    )}
                  </span>
                </summary>
                <div className="flex flex-col gap-1.5 px-4 pb-3 ps-[3.75rem] text-[13px] leading-relaxed">
                  {j.note && <p>{j.note[locale]}</p>}
                  <p className="text-muted-foreground">
                    {out ? (
                      <>
                        {j.roadHours != null && j.roadHours > 0 && `${city} ${arrow(locale)} ${e.name[locale]} ${formatDuration(j.roadHours, locale)} · `}
                        {formatDuration(j.hours, locale)} {m.to} {j.city[locale]}
                      </>
                    ) : (
                      <>
                        {formatDuration(j.hours, locale)} {m.to} {e.name[locale]}
                        {j.roadHours != null && j.roadHours > 0 && ` · ${formatDuration(j.roadHours, locale)} ${arrow(locale)} ${city}`}
                      </>
                    )}
                  </p>
                  <Provenance confidence={j.confidence} source={j.source} seen={j.seen} locale={locale} m={m} />
                  {al && j.airline && (
                    <Link href={href(airlinePath(j.airline))} className="self-start font-semibold text-primary underline-offset-4 hover:underline">
                      {al.name[locale]} {arrow(locale)}
                    </Link>
                  )}
                </div>
              </details>
            </li>
          )
        })}
      </ul>
      <p className="border-t px-4 py-2.5 text-[13px]">
        <Link href={href(entryPath(w.entry))} className="font-semibold text-primary underline-offset-4 hover:underline">
          {e.name[locale]} {arrow(locale)}
        </Link>
      </p>
    </div>
  )
}

