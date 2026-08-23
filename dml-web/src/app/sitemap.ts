import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/metadata";

/**
 * Diekspor supaya sitemap.test.ts bisa mencocokkan tiap path ke berkas
 * page.tsx yang benar-benar ada. Sebelum Plan 8, daftar ini memuat enam URL
 * yang 404 dan diiklankan ke mesin pencari selama tujuh plan.
 *
 * /bisnis/galangan-kapal dicoret permanen: PT Dutabahari Menara Line Dockyard
 * adalah perusahaan terpisah di dalam Sinar Alam Corporation, bukan lini DML,
 * dan perawatan armada DML sendiri dikerjakan afiliasi Dutabahari Teknik.
 * Lihat docblock di src/content/navigation.ts.
 *
 * /artikel dicabut sementara sampai Plan 9 membangun koleksi posts beserta
 * kedua route-nya. Saat itu path ini kembali, bersama slug artikel published
 * yang ditambahkan secara dinamis.
 */
export const STATIC_PATHS = [
  "/",
  "/tentang-kami",
  "/bisnis",
  "/bisnis/transportasi-bbm",
  "/bisnis/transportasi-bbm/permintaan-informasi",
  "/bisnis/penumpang-roro",
  "/karier",
  "/kontak",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return STATIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
