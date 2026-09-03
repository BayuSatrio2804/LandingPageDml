import type { Post } from "@/payload/payload-types";
import { formatTanggal } from "./format-date";
import { resolveMedia, resolveCategory } from "./article-list";

/**
 * Bentuk data yang dipakai komponen daftar dan kartu.
 *
 * Sengaja dipisah dari tipe Payload: komponen klien tidak boleh menerima
 * seluruh dokumen Post. Isi badan tulisan bisa puluhan kilobita per artikel
 * (array blocks, tiap paragraph membawa dokumen richText penuh), dan
 * mengirim semuanya ke klien hanya untuk menyaring judul membuat payload
 * halaman membengkak tanpa alasan.
 */
export type ArticleCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  categoryName: string;
  categorySlug: string;
  publishedAt: string;
  dateLabel: string;
  readingMinutes: number;
  image: { url: string; alt: string } | null;
};

export type CategoryOption = { slug: string; name: string };

export function toCard(post: Post): ArticleCard {
  const category = resolveCategory(post.category);
  const cover = resolveMedia(post.coverImage);
  return {
    id: String(post.id),
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    categoryName: category?.name ?? "Tanpa kategori",
    categorySlug: category?.slug ?? "",
    publishedAt: post.publishedAt,
    dateLabel: formatTanggal(post.publishedAt),
    readingMinutes: post.readingMinutes ?? 1,
    image: cover?.url ? { url: cover.url, alt: cover.alt ?? "" } : null,
  };
}
