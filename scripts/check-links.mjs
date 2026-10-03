// Opens every address on the Links page (data/links.json) and checks that each account and app is still linked
// from its card's "via" page, the page of the body's own website that vouches for it. For the weekly sweep: what
// it flags needs a look, then a fix in data/links.json or, if all is well, a fresh `seen` on the card.
//   npm run links
// Facebook, Instagram and X answer scripts with a login wall, so their accounts are checked through "via" only.
// Sites behind a bot wall (Cloudflare) come back as "open it in a browser": that is not a broken link.
import { readFileSync } from "node:fs"

const cards = JSON.parse(readFileSync(new URL("../data/links.json", import.meta.url), "utf8"))
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 fly.sy-link-check"
const WALLED = /(^|\.)(facebook|instagram|x|twitter)\.com$/
const ACCOUNT = (kind) => kind !== "site" && kind !== "page"
const urls = (l) => [...new Set(typeof l.url === "string" ? [l.url] : [l.url.ar, l.url.en])]
const host = (u) => new URL(u).host.replace(/^www\./, "")

// What must appear on the via page for an account to count as still linked: its address without scheme or www,
// or the part that identifies it where the rest varies (the App Store id, the Play package, the channel id).
const needle = (l, u) => {
  if (l.kind === "ios") return u.match(/id\d+/)[0]
  if (l.kind === "android") return `id=${new URL(u).searchParams.get("id")}`.toLowerCase()
  return `${host(u)}${new URL(u).pathname}`.replace(/\/$/, "").toLowerCase()
}

async function get(url) {
  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(20000), headers: { "user-agent": UA, accept: "text/html,*/*" } })
    return { status: res.status, final: res.url, text: await res.text() }
  } catch (e) {
    return { status: 0, final: url, text: "", error: e.cause?.code ?? e.name }
  }
}

/** The via page and the scripts it loads from its own host: a site built as a single-page app keeps its footer links there. */
async function viaText(via) {
  const page = await get(via)
  if (page.status < 200 || page.status >= 300) return { ...page, text: null }
  const scripts = [...page.text.matchAll(/<script[^>]+src="([^"]+\.js)"/g)]
    .map((m) => new URL(m[1], page.final).href)
    .filter((s) => host(s) === host(page.final))
    .slice(0, 12)
  const bodies = await Promise.all(scripts.map(async (s) => (await get(s)).text))
  return { ...page, text: [page.text, ...bodies].join("\n").toLowerCase() }
}

const found = []
const flag = (level, id, msg) => found.push({ level, id, msg })
let checked = 0

// A few at a time, so no single site sees a burst.
const jobs = cards.flatMap((c) =>
  c.links.flatMap((l) => urls(l).map((u) => ({ c, l, u }))).filter(({ u }) => !WALLED.test(host(u))),
)
await Promise.all(
  Array.from({ length: 6 }, async () => {
    for (let job = jobs.shift(); job; job = jobs.shift()) {
      const { c, l, u } = job
      const r = await get(u)
      checked++
      if (r.status >= 200 && r.status < 300) {
        if (host(r.final) !== host(u)) flag("moved", c.id, `${u} now opens ${r.final}`)
      } else if ([401, 403, 429, 503].includes(r.status)) {
        flag("blocked", c.id, `${u} answered ${r.status} to a script; open it in a browser`)
      } else {
        flag("broken", c.id, `${l.kind} ${u}: ${r.status || r.error}`)
      }
    }
  }),
)

for (const c of cards.filter((x) => x.via)) {
  const accounts = c.links.filter((l) => ACCOUNT(l.kind))
  if (!accounts.length) continue
  const via = await viaText(c.via)
  if (via.text === null) {
    flag("blocked", c.id, `could not read ${c.via} (${via.status || via.error}); check its ${accounts.length} accounts by hand`)
    continue
  }
  for (const l of accounts)
    for (const u of urls(l)) if (!via.text.includes(needle(l, u))) flag("unlinked", c.id, `${l.kind} ${u} is no longer linked from ${c.via}`)
}

const MARK = { broken: "✗", unlinked: "✗", moved: "!", blocked: "?" }
console.log(`${cards.length} cards, ${checked} addresses opened, accounts checked against ${cards.filter((c) => c.via).length} via pages`)
for (const level of ["broken", "unlinked", "moved", "blocked"])
  for (const f of found.filter((x) => x.level === level)) console.log(`  ${MARK[level]} ${level.padEnd(8)} ${f.id}: ${f.msg}`)
const failed = found.filter((f) => f.level === "broken" || f.level === "unlinked").length
console.log(failed ? `${failed} to fix in data/links.json` : "nothing broken; bump `seen` on the cards you looked at")
process.exit(failed ? 1 : 0)
