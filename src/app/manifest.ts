import type { MetadataRoute } from "next"

// Installable on Android and iOS from the browser menu. Arabic is the default
// locale of the site, so the manifest names it in Arabic; the English toggle is a
// cookie, which a manifest cannot see.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "fly.sy — كيف تصل إلى سوريا",
    short_name: "fly.sy",
    description: "كل طريق إلى سوريا، مع مصدر كل معلومة وتاريخ مراجعتها. موقع مستقل غير رسمي.",
    lang: "ar",
    dir: "rtl",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f5f6f3",
    theme_color: "#0e5c3f",
    categories: ["travel", "navigation"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
