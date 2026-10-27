// The picture on a news card: the one its source posted with the news, saved to public/news/{id}.webp at up to 1200px
// wide. Committed like the emblems, so the build fetches nothing; served from our own assets, because hotlinking would
// send every reader's IP to the source and Telegram's image links expire.
//   npm run news-images -- <id>          lists the pictures the item's post carries and saves each to a temp folder to look at
//   npm run news-images -- <id> <n|url>  writes picture n from that list (or any image URL) and prints the `image` fields
// The `alt` text is written by hand: say what the picture shows, in both languages.
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import sharp from "sharp"

const [id, pick] = process.argv.slice(2)
if (!id) throw new Error("usage: npm run news-images -- <news id> [<n> | <image url>]")
const news = JSON.parse(await readFile("data/news.json", "utf8"))
const item = news.find((n) => n.id === id)
if (!item?.url) throw new Error(`${id}: no such news item, or it has no url`)

const get = async (url) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(30000), headers: { "user-agent": "Mozilla/5.0 fly.sy" } })
  if (!res.ok) throw new Error(`${url} answered ${res.status}`)
  return res
}

/** The pictures on the post: a Telegram post's photos and video stills, or a web page's og:image. */
async function pictures(url) {
  const tg = url.match(/^https:\/\/t\.me\/(\w+)\/(\d+)$/)
  const html = await (await get(tg ? `${url}?embed=1&mode=tme` : url)).text()
  const found = tg
    ? [...html.matchAll(/tgme_widget_message_(?:photo_wrap|video_thumb)[^>]*?background-image:url\('([^']+)'\)/g)].map((m) => m[1])
    : [...html.matchAll(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]*>/g)]
        .map((m) => m[0].match(/content=["']([^"']+)["']/)?.[1])
        .filter(Boolean)
        .map((src) => new URL(src.replaceAll("&amp;", "&"), url).href)
  return [...new Set(found)]
}

if (!pick) {
  const dir = join(tmpdir(), "fly-news", id)
  await mkdir(dir, { recursive: true })
  const list = await pictures(item.url)
  if (list.length === 0) console.log(`${id}: no picture on ${item.url}`)
  for (const [i, src] of list.entries()) {
    // An album's older photos can expire on Telegram's side; list the rest.
    const buf = await get(src).then((r) => r.arrayBuffer()).then(Buffer.from, (e) => (console.log(`${i + 1}  gone: ${e.message}`), null))
    if (!buf) continue
    const { width, height, format } = await sharp(buf).metadata()
    const file = join(dir, `${i + 1}.${format}`)
    await writeFile(file, buf)
    console.log(`${i + 1}  ${width}x${height}  ${file}  ${src}`)
  }
} else {
  const src = /^\d+$/.test(pick) ? (await pictures(item.url))[Number(pick) - 1] : pick
  if (!src) throw new Error(`${id}: no picture ${pick} on ${item.url}`)
  const buf = Buffer.from(await (await get(src)).arrayBuffer())
  await mkdir("public/news", { recursive: true })
  const out = `public/news/${id}.webp`
  const { width, height, size } = await sharp(buf)
    .rotate()
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(out)
  console.log(`${out}  ${size} bytes  from ${src}`)
  console.log(`"image":{"src":"/news/${id}.webp","width":${width},"height":${height},"alt":{"ar":"","en":""}}`)
}
