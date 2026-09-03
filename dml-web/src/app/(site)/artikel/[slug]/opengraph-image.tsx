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
 * Byte cover untuk kartu OG.
 *
 * Penyimpanan disk (dev, Docker + volume): dibaca langsung lewat
 * MEDIA_STATIC_DIR (Task 18). generateStaticParams artikel berjalan saat
 * next build, sebelum ada server HTTP yang bisa dituju, jadi fetch ke diri
 * sendiri tidak bisa diandalkan.
 *
 * Penyimpanan R2 (Vercel): tidak ada berkas di disk build. `url` sudah
 * berupa URL publik absolut R2, jadi byte-nya diambil lewat fetch ke sana.
 *
 * Satori tidak bisa mendekode WebP (lihat og-template.tsx), jadi byte-nya
 * tetap harus lewat toOgSafeImageDataUri apa pun sumbernya.
 */
async function readCoverBytes(filename: string, url?: string | null) {
  if (url && /^https?:\/\//.test(url)) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Gagal ambil cover OG (${res.status}): ${url}`);
    }
    return Buffer.from(await res.arrayBuffer());
  }
  return readFile(path.join(MEDIA_STATIC_DIR, filename));
}

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
  const imageUrl = cover?.filename
    ? await toOgSafeImageDataUri(await readCoverBytes(cover.filename, cover.url))
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
