import type { Metadata } from "next"
import { LOCALES } from "@/lib/site"
import { RoutePage, routeMetadata, routeParams, type RouteParams } from "@/components/route-page"

type Props = { params: Promise<RouteParams> }

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => routeParams().map((p) => ({ lang, ...p })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return routeMetadata(await params)
}

export default async function Page({ params }: Props) {
  return <RoutePage {...(await params)} />
}
