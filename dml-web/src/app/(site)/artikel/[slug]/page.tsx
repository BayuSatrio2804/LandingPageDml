import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { buildMetadata, absoluteUrl } from "@/lib/seo/metadata";
import { articleJsonLd, breadcrumbJsonLd, safeJsonLdString } from "@/lib/seo/json-ld";
import { findPublishedPost, listPublishedSlugs } from "@/features/articles/queries";
import { resolveMedia, CATEGORY_LABELS } from "@/features/articles/article-list";
import { formatTanggal } from "@/features/articles/format-date";
import type { User } from "@/payload/payload-types";

/**
 * JANGAN menambahkan `export const dynamicParams = false` di berkas ini.
 *
 * Saat `next build` berjalan, koleksi artikel bisa saja kosong, sehingga
 * generateStaticParams di bawah mengembalikan array kosong. Artikel yang
 * dipublikasikan SETELAH build hanya bisa dirender karena dynamicParams
 * bernilai true secara default. Mematikannya membunuh persis alur yang jadi
 * alasan keberadaan seluruh pipeline CMS ini, dan matinya senyap: build
 * tetap hijau, tes unit tetap hijau, hanya alur publish yang mati.
 *
 * Catatan terkait: dynamicParams tidak tersedia saat cacheComponents menyala.
 * Itu satu alasan tambahan, di luar risiko Payload, kenapa cacheComponents
 * tetap mati untuk rilis ini.
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
  if (!post) return buildMetadata({
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

export default async function ArtikelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await findPublishedPost(slug);
  if (!post) notFound();

  const cover = resolveMedia(post.coverImage);
  const author = typeof post.author === "object" && post.author !== null
    ? (post.author as User)
    : null;

  const trail = breadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Artikel", path: "/artikel" },
    { name: post.title, path: `/artikel/${post.slug}` },
  ]);

  const article = articleJsonLd({
    title: post.seo?.metaTitle ?? post.title,
    description: post.seo?.metaDescription ?? post.excerpt,
    path: `/artikel/${post.slug}`,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    ...(cover?.url ? { imageUrl: absoluteUrl(cover.url) } : {}),
    ...(author?.name ? { authorName: author.name } : {}),
  });

  return (
    <article className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[70ch]">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-ink-muted">
          <span>{CATEGORY_LABELS[post.category] ?? post.category}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.publishedAt}>{formatTanggal(post.publishedAt)}</time>
          {author?.name ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{author.name}</span>
            </>
          ) : null}
        </p>
        <h1 className="mt-4 font-display text-pretty text-4xl font-bold tracking-tight text-ink md:text-5xl">
          {post.title}
        </h1>
      </div>

      {cover?.url ? (
        <Image
          src={cover.url}
          alt={cover.alt ?? ""}
          width={cover.width ?? 1600}
          height={cover.height ?? 900}
          sizes="(min-width: 1400px) 1400px, 100vw"
          className="mt-10 aspect-[16/9] w-full rounded-card object-cover"
        />
      ) : null}

      {/*
        Renderer resmi Payload, bukan serializer tangan. Menulis pemetaan node
        Lexical sendiri berarti memeliharanya selamanya untuk sesuatu yang
        sudah disediakan paket yang sudah jadi dependency.
      */}
      <div className="prose-artikel mx-auto mt-12 max-w-[70ch] text-ink">
        <RichText data={post.content as SerializedEditorState} />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(trail) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(article) }}
      />
    </article>
  );
}
