import { notFound } from "next/navigation"

/** Anything the routes above did not claim is a 404 rendered in the language of the URL. */
export default function CatchAll() {
  notFound()
}
