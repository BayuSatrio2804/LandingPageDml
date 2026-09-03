import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/metadata";
import { listPublishedPosts } from "@/features/articles/queries";

/**
 * Diekspor supaya sitemap.test.ts bisa mencocokkan tiap path ke berkas
 * page.tsx yang benar-benar ada. Sebelum Plan 8, daftar ini memuat enam URL
 * yang 404 dan diiklankan ke mesin pencari selama tujuh plan.
 *
 * /bisnis/galangan-kapal dicoret permanen: PT Dutabahari Menara Line Dockyard
 * adalah perusahaan terpisah di dalam Sinar Alam Corporation, bukan lini DML.
 * Lihat docblock di src/lib/cms/company-seed.ts.
 *
 * /artikel kembali sejak Plan 9, bersama slug artikel published yang
 * ditambahkan secara dinamis di bawah.
 */
export const STATIC_PATHS = [
  "/",
  "/tentang-kami",
  "/bisnis",
  "/bisnis/transportasi-bbm",
  "/bisnis/transportasi-bbm/permintaan-informasi",
  "/bisnis/penumpang-roro",
  "/artikel",
  "/karier",
  "/kontak",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statis: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));

  /**
   * Kegagalan database tidak boleh menjatuhkan sitemap. Sitemap yang gagal
   * berarti `next build` gagal, dan kehilangan entri artikel untuk sementara
   * jauh lebih ringan daripada situs yang tidak bisa dibangun sama sekali.
   */
  let artikel: MetadataRoute.Sitemap = [];
  try {
    const posts = await listPublishedPosts();
    artikel = posts.map((post) => ({
      url: absoluteUrl(`/artikel/${post.slug}`),
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch (error) {
    console.error("sitemap: gagal memuat artikel", error);
  }

  return [...statis, ...artikel];
}
