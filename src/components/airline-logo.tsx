import Image from "next/image"
import { cn } from "@/lib/utils"

// One PNG per carrier in public/airlines/{IATA}.png, with a dark-surface variant
// in public/airlines/dark/. Both ship at 70px, so a 40px tile stays sharp on a
// phone; `unoptimized` because 2KB files gain nothing from an image service and
// the Cloudflare build has none. Decorative: the airline's name always sits
// beside it. `npm test` checks that every carrier in data/airlines.json has both files.
// `light`: the tile is white in both schemes (on a sign, a board, a list of
// links), so it always takes the light-surface logo; the dark one is drawn for a
// dark tile, and on white its lettering disappears.
export function AirlineLogo({ code, className, light = false }: { code: string; className?: string; light?: boolean }) {
  const cls = cn("size-full object-contain", className)
  if (light) return <Image src={`/airlines/${code}.png`} alt="" width={70} height={70} unoptimized className={cls} />
  return (
    <>
      <Image src={`/airlines/${code}.png`} alt="" width={70} height={70} unoptimized className={cn(cls, "dark:hidden")} />
      <Image src={`/airlines/dark/${code}.png`} alt="" width={70} height={70} unoptimized className={cn(cls, "hidden dark:block")} />
    </>
  )
}
