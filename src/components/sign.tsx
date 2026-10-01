import { Car, Plane } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Mode } from "@/lib/types"

/**
 * The road sign the site is built from: a green plate with a white rule set in
 * from its edge. `muted` is the same sign for a way that does not run.
 */
export const signClass = (muted = false) =>
  cn(
    "rounded-[10px]",
    muted
      ? "bg-muted text-muted-foreground shadow-[inset_0_0_0_4px_var(--muted),inset_0_0_0_6px_var(--input)]"
      : "bg-primary text-primary-foreground shadow-[inset_0_0_0_4px_var(--primary),inset_0_0_0_6px_var(--primary-foreground)]",
  )

/**
 * What you travel in, where a road sign has its pictogram: a plane for a
 * flight, a car for a crossing, both when a flight is followed by a drive.
 * Decorative: the sign's words say the same.
 */
export function ModeIcons({ modes, size = "md" }: { modes: Mode[]; size?: "md" | "lg" }) {
  const two = modes.length > 1
  return (
    <span className="inline-flex shrink-0 gap-1" aria-hidden="true">
      {modes.map((m) => {
        const Icon = m === "air" ? Plane : Car
        return (
          <span
            key={m}
            className={cn(
              "grid place-items-center rounded-lg bg-primary-foreground text-primary",
              size === "lg" && !two ? "size-12 [&_svg]:size-7" : two ? "size-9 [&_svg]:size-5" : "size-10 [&_svg]:size-6",
            )}
          >
            <Icon strokeWidth={2.2} />
          </span>
        )
      })}
    </span>
  )
}
