import Image from "next/image"
import { cn } from "@/lib/utils"

// One PNG per carrier in public/airlines/{IATA}.png, with a dark-surface variant
// in public/airlines/dark/. Both ship at 70px, so a 40px tile stays sharp on a
// phone; `unoptimized` because 2KB files gain nothing from an image service and
// the Cloudflare build has none. Decorative: the airline's name always sits
// beside it. `npm test` checks that every carrier in data/airlines.json has both files.
export function AirlineLogo({ code, className }: { code: string; className?: string }) {
  const cls = cn("size-full object-contain", className)
  return (
    <>
      <Image src={`/airlines/${code}.png`} alt="" width={70} height={70} unoptimized className={cn(cls, "dark:hidden")} />
      <Image src={`/airlines/dark/${code}.png`} alt="" width={70} height={70} unoptimized className={cn(cls, "hidden dark:block")} />
    </>
  )
}
