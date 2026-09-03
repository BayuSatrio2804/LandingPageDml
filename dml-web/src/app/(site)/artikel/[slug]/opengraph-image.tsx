import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { OgCard, OG_SIZE, OG_CONTENT_TYPE, loadOgFont, toOgSafeImageDataUri } from "@/lib/seo/og-template";
import { findPublishedPost } from "@/features/articles/queries";
import { resolveMedia, resolveCategory } from "@/features/articles/article-list";
import { MEDIA_STATIC_DIR } from "@/payload/collections/Media";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Artikel PT Dutabahari Menara Line";

/**
 * Berkas ini duduk di segmen yang sama dengan page.tsx artikel, jadi
 * menurut dokumentasi Next ia menang atas objek metadata biasa yang
 * dikembalikan generateMetadata di segmen itu -- termasuk default
 * openGraph.images korporat yang diset buildMetadata() (Task 14).
 * Diverifikasi empiris di Step 2 task ini: kartu yang muncul untuk
 * /artikel/<slug> adalah kartu ini, bukan og-corporate.png.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, font] = await Promise.all([findPublishedPost(slug), loadOgFont()]);

  const cover = post ? resolveMedia(post.coverImage) : null;
  /**
   * Dibaca langsung dari disk lewat MEDIA_STATIC_DIR (Task 18), bukan path
   * ditulis ulang di sini atau lewat fetch ke /api/media/file/<nama>.
   * generateStaticParams artikel berjalan saat next build, sebelum ada
   * server HTTP yang bisa dituju; fetch ke diri sendiri saat itu tidak bisa
   * diandalkan. Satori juga tidak bisa mendekode WebP (lihat
   * og-template.tsx), jadi byte-nya tetap harus lewat toOgSafeImageDataUri
   * apa pun sumbernya.
   */
  const imageUrl = cover?.filename
    ? await toOgSafeImageDataUri(
        await readFile(path.join(MEDIA_STATIC_DIR, cover.filename)),
      )
    : undefined;

  return new ImageResponse(
    (
      <OgCard
        kicker={post ? (resolveCategory(post.category)?.name ?? "Artikel") : "Artikel"}
        title={post?.title ?? "Artikel"}
        {...(imageUrl ? { imageUrl } : {})}
      />
    ),
    {
      ...size,
      fonts: [{ name: "GT America", data: font, style: "normal", weight: 700 }],
    },
  );
}
