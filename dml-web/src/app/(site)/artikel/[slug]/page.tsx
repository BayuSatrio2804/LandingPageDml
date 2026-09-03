import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { buildMetadata, absoluteUrl } from "@/lib/seo/metadata";
import { articleJsonLd, breadcrumbJsonLd, safeJsonLdString } from "@/lib/seo/json-ld";
import { findPublishedPost, listPublishedPosts, listPublishedSlugs } from "@/features/articles/queries";
import { resolveMedia } from "@/features/articles/article-list";
import { toCard, type ArticleCard } from "@/features/articles/types";
import { ArticleHeader } from "@/features/articles/article-header";
import { ArticleBlocks } from "@/features/articles/article-blocks";
import { ShareRail } from "@/features/articles/share-rail";
import { RelatedArticles } from "@/features/articles/related-articles";
import type { Post, User } from "@/payload/payload-types";
import { getCompanyProfile } from "@/lib/cms/company";

/**
 * JANGAN menambahkan `export const dynamicParams = false` di berkas ini.
 *
 * Saat `next build` berjalan, koleksi artikel bisa saja kosong, sehingga
 * generateStaticParams di bawah mengembalikan array kosong. Artikel yang
 * dipublikasikan SETELAH build hanya bisa dirender karena dynamicParams
 * bernilai true secara default. Mematikannya membunuh persis alur yang jadi
 * alasan keberadaan seluruh pipeline CMS ini, dan matinya senyap: build
 * tetap hijau, tes unit tetap hijau, hanya alur publish yang mati.
 */
export async function generateStaticParams() {
  const slugs = await listPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await findPublishedPost(slug);
  if (!post)
    return buildMetadata({
      title: "Artikel tidak ditemukan | PT Dutabahari Menara Line",
      description: "Artikel yang dicari tidak tersedia.",
      path: `/artikel/${slug}`,
      ownImage: true,
    });

  return buildMetadata({
    title: `${post.seo?.metaTitle ?? post.title} | PT Dutabahari Menara Line`,
    description: post.seo?.metaDescription ?? post.excerpt,
    path: `/artikel/${post.slug}`,
    ownImage: true,
  });
}

/** channel default kalau admin belum pernah menyimpan global articles-page. */
const DEFAULT_SHARE_CHANNELS: Array<"whatsapp" | "linkedin" | "x" | "email" | "copy"> = [
  "whatsapp",
  "linkedin",
  "x",
  "email",
  "copy",
];

async function relatedFor(post: Post): Promise<ArticleCard[]> {
  const manual = Array.isArray(post.relatedOverride)
    ? post.relatedOverride.filter(
        (item): item is Post => typeof item === "object" && item !== null,
      )
    : [];
  if (manual.length) return manual.map(toCard);

  /*
   * Otomatis adalah default dengan sengaja: kalau setiap artikel harus
   * dipilih manual, artikel yang baru dibuat tidak akan pernah muncul
   * sebagai "terkait" di artikel lama.
   */
  const category = typeof post.category === "object" ? post.category : null;
  const semua = await listPublishedPosts(50);
  const sisa = semua.filter((item) => item.id !== post.id);
  const kategoriSama = category
    ? sisa.filter((item) => typeof item.category === "object" && item.category?.id === category.id)
    : [];
  const dipilih = (kategoriSama.length ? kategoriSama : sisa).slice(0, 3);
  return dipilih.map(toCard);
}

export default async function ArtikelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await findPublishedPost(slug);
  if (!post) notFound();

  const payload = await getPayload({ config });
  const [page, company] = await Promise.all([
    payload.findGlobal({ slug: "articles-page" }),
    getCompanyProfile(),
  ]);

  const article = toCard(post);
  const cover = resolveMedia(post.coverImage);
  const author = typeof post.author === "object" && post.author !== null ? (post.author as User) : null;
  const related = await relatedFor(post);
  const channels = page.shareChannels?.length ? page.shareChannels : DEFAULT_SHARE_CHANNELS;

  const trail = breadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Artikel", path: "/artikel" },
    { name: post.title, path: `/artikel/${post.slug}` },
  ]);

  const articleLd = articleJsonLd(company, {
    title: post.seo?.metaTitle ?? post.title,
    description: post.seo?.metaDescription ?? post.excerpt,
    path: `/artikel/${post.slug}`,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    ...(cover?.url ? { imageUrl: absoluteUrl(cover.url) } : {}),
    ...(author?.name ? { authorName: author.name } : {}),
  });

  return (
    <article>
      <ArticleHeader article={article} />

      <section className="relative overflow-hidden bg-surface-2 pt-16 pb-24">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(56%_48%_at_92%_8%,var(--color-surface)_0%,transparent_58%)]"
        />
        <div className="relative mx-auto grid max-w-270 grid-cols-[64px_1fr] gap-10 px-8 max-lg:grid-cols-1">
          <ShareRail title={article.title} channels={channels} />
          <div>
            <ArticleBlocks blocks={post.content} />

            <div className="mt-14 border-t border-accent-soft pt-6.5">
              <p className="m-0 font-mono text-[11px] tracking-[0.14em] text-line uppercase">Kategori</p>
              <ul className="mt-3.5 flex list-none flex-wrap gap-2.25 p-0">
                <li className="rounded-full border border-accent-soft bg-surface px-3.75 py-1.75 font-mono text-[11px] text-accent">
                  {article.categoryName}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <RelatedArticles articles={related} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(trail) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(articleLd) }}
      />
    </article>
  );
}
