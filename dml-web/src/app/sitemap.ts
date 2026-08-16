import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/metadata";

// Slug artikel ditambahkan di Plan 4 ketika Payload sudah ada.
const STATIC_PATHS = [
  "/",
  "/tentang-kami",
  "/bisnis",
  "/bisnis/transportasi-bbm",
  "/bisnis/penumpang-roro",
  "/bisnis/galangan-kapal",
  "/karier",
  "/artikel",
  "/kontak",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return STATIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: path === "/artikel" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
