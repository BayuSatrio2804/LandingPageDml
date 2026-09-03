import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, safeJsonLdString } from "@/lib/seo/json-ld";
import { listPublishedPosts } from "@/features/articles/queries";
import { FeaturedArticle } from "@/features/articles/featured-article";
import { ArticleBrowser } from "@/features/articles/article-browser";
import { toCard } from "@/features/articles/types";
import type { Post } from "@/payload/payload-types";

export const metadata: Metadata = buildMetadata({
  title: "Artikel | PT Dutabahari Menara Line",
  description:
    "Kabar operasi, armada, dan keselamatan dari PT Dutabahari Menara Line, perusahaan pelayaran Banjarmasin sejak 1988.",
  path: "/artikel",
});

// Halaman ini dibangun ulang di latar saat ada artikel baru; tidak perlu
// dirender per permintaan.
export const revalidate = 300;

export default async function ArtikelPage() {
  const payload = await getPayload({ config });

  const [page, posts, categoriesResult] = await Promise.all([
    payload.findGlobal({ slug: "articles-page", depth: 1 }),
    listPublishedPosts(200),
    payload.find({ collection: "categories", sort: "name", limit: 100 }),
  ]);

  const all = posts.map(toCard);

  // Unggulan: pilihan admin kalau ada, kalau tidak artikel terbit terbaru
  // (listPublishedPosts sudah terurut -publishedAt).
  const featuredPost = typeof page.featured === "object" ? (page.featured as Post | null) : null;
  const featured = (featuredPost && all.find((item) => item.id === String(featuredPost.id))) || all[0] || null;

  // Unggulan dikeluarkan dari kisi supaya tidak tampil dua kali di satu halaman.
  const rest = featured ? all.filter((item) => item.id !== featured.id) : all;

  const trail = breadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Artikel", path: "/artikel" },
  ]);

  return (
    <>
      <section className="relative overflow-hidden bg-surface pt-18 pb-14">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(66%_100%_at_50%_0%,var(--color-surface-2)_0%,transparent_62%)]"
        />
        <div className="relative mx-auto max-w-350 px-8">
          <h1 className="m-0 font-display text-[clamp(2.25rem,4.2vw,3.5rem)] leading-[1.04] font-bold tracking-[-0.025em] text-ink">
            {page.heading}
          </h1>
          <p className="mt-5 mb-0 max-w-[56ch] text-[17px] leading-[1.72] text-ink-muted">
            {page.intro}
          </p>
          {/* Pita catatan disembunyikan begitu admin mengosongkan fieldnya. */}
          {page.notice ? (
            <p className="mt-5.5 mb-0 inline-flex items-center gap-2.25 rounded-full border border-surface-3 px-3.75 py-1.75 font-mono text-[11px] tracking-[0.12em] text-ink-muted">
              <span aria-hidden="true" className="block size-1.5 rounded-full bg-line" />
              {page.notice}
            </p>
          ) : null}
        </div>
      </section>

      {featured ? <FeaturedArticle article={featured} /> : null}

      <ArticleBrowser
        articles={rest}
        categories={categoriesResult.docs.map((category) => ({
          slug: category.slug,
          name: category.name,
        }))}
        pageSize={page.pageSize ?? 6}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(trail) }}
      />
    </>
  );
}
