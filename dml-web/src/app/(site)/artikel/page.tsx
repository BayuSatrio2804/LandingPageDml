import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, safeJsonLdString } from "@/lib/seo/json-ld";
import { listPublishedPosts } from "@/features/articles/queries";
import { ArticleList } from "@/features/articles/article-list";

export const metadata: Metadata = buildMetadata({
  title: "Artikel | PT Dutabahari Menara Line",
  description:
    "Kabar operasi, armada, dan keselamatan dari PT Dutabahari Menara Line, perusahaan pelayaran Banjarmasin sejak 1988.",
  path: "/artikel",
});

/**
 * Paginasi sengaja belum dibangun. Ambang di bawah adalah titik di mana ia
 * mulai layak: selama jumlah artikel published masih di bawahnya, paginasi
 * adalah kode yang tidak pernah dieksekusi. Kalau ambang ini terlampaui,
 * tambahkan paginasi, jangan diam-diam memotong daftar.
 */
const AMBANG_PAGINASI = 20;

export default async function ArtikelPage() {
  const posts = await listPublishedPosts(AMBANG_PAGINASI);
  const trail = breadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Artikel", path: "/artikel" },
  ]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
      <h1 className="font-display text-pretty text-4xl font-bold tracking-tight text-ink md:text-5xl">
        Artikel
      </h1>
      <p className="mt-4 max-w-[60ch] text-ink-muted">
        Kabar operasi, armada, dan keselamatan dari lapangan.
      </p>

      <ArticleList posts={posts} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(trail) }}
      />
    </div>
  );
}
