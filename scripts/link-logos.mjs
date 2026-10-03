// Pulls the emblems the Links page shows from each body's own website and writes them to public/emblems/ at 80px
// (a 40px tile, sharp on a phone). Run with `npm run logos` when a body changes its emblem; the outputs are
// committed, so the build never fetches anything. Served from our own static assets: hotlinking would send every
// visitor's IP to the official sites, and break whenever one is down. The carriers' logos are public/airlines/.
//   gaca    the civil aviation authority's wings, the icon its airports' sites use
//   emblem  the state eagle, as the foreign ministry's site uses it (also the ports authority's and the interior ministry's mark)
import { mkdir, writeFile } from "node:fs/promises"
import sharp from "sharp"

const SOURCES = {
  gaca: "https://damairport.gov.sy/icon.php?size=180",
  emblem: "https://mofaex.gov.sy/assets/favicon.png",
}

await mkdir("public/emblems", { recursive: true })
for (const [name, url] of Object.entries(SOURCES)) {
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) })
  if (!res.ok) throw new Error(`${name}: ${url} answered ${res.status}`)
  const png = await sharp(Buffer.from(await res.arrayBuffer()))
    .trim()
    .resize(80, 80, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ palette: true, compressionLevel: 9 })
    .toBuffer()
  await writeFile(`public/emblems/${name}.png`, png)
  console.log(`public/emblems/${name}.png  ${png.length} bytes  from ${url}`)
}
