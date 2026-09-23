// Builds every raster brand asset from src/app/icon.svg. Run with `npm run icons`
// after changing the mark; the outputs are committed so the build never needs to.
//
//   src/app/favicon.ico            16 + 32 + 48, for browsers that ignore the SVG
//   src/app/apple-icon.png         180, full-bleed: iOS rounds the corners itself
//   public/icon-192.png            manifest, purpose "any"
//   public/icon-512.png            manifest, purpose "any"
//   public/icon-maskable-512.png   manifest, purpose "maskable": glyph inside the safe zone
//   src/app/opengraph-image.png    1200x630 share card: the mark beside the tagline
//
// sharp comes with Next, so this needs nothing installed beyond `npm install`.
// The share card sets its text in Readex Pro, which must be installed on the
// machine running this (fontconfig finds it); otherwise it falls back to whatever
// sans-serif is around and the card should not be committed.

import { readFile, writeFile } from "node:fs/promises"
import sharp from "sharp"

const GREEN = "#0e5c3f"
const GROUND = "#f5f6f3"
const INK = "#1c2a25"
const MUTED = "#5c6b65"
const BORDER = "#e3e6e1"

const source = await readFile("src/app/icon.svg", "utf8")
// Everything drawn on top of the tile: the country and the plane cut out of it.
const mark = source.match(/<g id="mark">[\s\S]*?<\/g>\s*<\/g>/)[0]

// The tile with its corner radius, as the SVG draws it.
const tile = (size) => sharp(Buffer.from(source), { density: (72 * size) / 100 }).resize(size, size)

// A square that fills the canvas edge to edge. iOS and the maskable manifest
// slot both apply their own mask, so rounded corners here would show as a
// white or transparent frame inside theirs. `inset` scales the mark towards
// the centre for the maskable safe zone.
const square = (size, inset = 1) =>
  sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
         <rect width="100" height="100" fill="${GREEN}"/>
         <g transform="translate(50 50) scale(${inset}) translate(-50 -50)">${mark}</g>
       </svg>`,
    ),
    { density: (72 * size) / 100 },
  ).resize(size, size)

/**
 * ICO container around PNG entries, which every browser since IE has read.
 * Header, one 16-byte directory entry per image, then the images.
 */
function ico(pngs) {
  const dir = Buffer.alloc(6 + 16 * pngs.length)
  dir.writeUInt16LE(0, 0)
  dir.writeUInt16LE(1, 2)
  dir.writeUInt16LE(pngs.length, 4)
  let offset = dir.length
  pngs.forEach(({ size, png }, i) => {
    const at = 6 + 16 * i
    dir.writeUInt8(size === 256 ? 0 : size, at)
    dir.writeUInt8(size === 256 ? 0 : size, at + 1)
    dir.writeUInt8(0, at + 2)
    dir.writeUInt8(0, at + 3)
    dir.writeUInt16LE(1, at + 4)
    dir.writeUInt16LE(32, at + 6)
    dir.writeUInt32LE(png.length, at + 8)
    dir.writeUInt32LE(offset, at + 12)
    offset += png.length
  })
  return Buffer.concat([dir, ...pngs.map((p) => p.png)])
}

function shareCard() {
  const R = 1130 // right edge of the text column
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"
       font-family="Readex Pro">
    <rect width="1200" height="630" fill="${GROUND}"/>
    <g transform="translate(90 165) scale(3)">
      <rect width="100" height="100" rx="22" fill="${GREEN}"/>
      ${mark}
    </g>
    <text x="${R}" y="128" text-anchor="end" font-size="46" font-weight="700" fill="${INK}" letter-spacing="-1">fly<tspan fill="${GREEN}">.sy</tspan></text>
    <text x="${R}" y="318" direction="rtl" text-anchor="start" font-size="76" font-weight="700" fill="${INK}">كيف تصل إلى سوريا</text>
    <text x="${R}" y="378" direction="rtl" text-anchor="start" font-size="30" font-weight="400" fill="${MUTED}">كل طريق، ومصدر كل معلومة، وتاريخ مراجعتها</text>
    <text x="${R}" y="436" text-anchor="end" font-size="26" font-weight="400" fill="${MUTED}">How to get into Syria, with a source on every line.</text>
    <g transform="translate(${R} 500)" font-size="20" font-weight="500" fill="${MUTED}">
      <rect x="-198" y="0" width="198" height="50" rx="14" fill="none" stroke="${BORDER}" stroke-width="2"/>
      <text x="-99" y="33" text-anchor="middle" direction="rtl">مستقل · غير رسمي</text>
      <rect x="-482" y="0" width="266" height="50" rx="14" fill="none" stroke="${BORDER}" stroke-width="2"/>
      <text x="-349" y="33" text-anchor="middle">Independent · Unofficial</text>
    </g>
  </svg>`
}

const png = (s) => s.png({ compressionLevel: 9, palette: false }).toBuffer()

const [i16, i32, i48] = await Promise.all([16, 32, 48].map((s) => png(tile(s))))
await writeFile("src/app/favicon.ico", ico([{ size: 16, png: i16 }, { size: 32, png: i32 }, { size: 48, png: i48 }]))
await square(180).flatten({ background: GREEN }).png({ compressionLevel: 9 }).toFile("src/app/apple-icon.png")
await tile(192).png({ compressionLevel: 9 }).toFile("public/icon-192.png")
await tile(512).png({ compressionLevel: 9 }).toFile("public/icon-512.png")
await square(512, 0.8).flatten({ background: GREEN }).png({ compressionLevel: 9 }).toFile("public/icon-maskable-512.png")
await sharp(Buffer.from(shareCard())).png({ compressionLevel: 9 }).toFile("src/app/opengraph-image.png")
console.log("icons written")
