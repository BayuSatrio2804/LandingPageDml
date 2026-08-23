import Image from "next/image";
import Link from "next/link";
import type { Media, Post } from "@/payload/payload-types";
import { formatTanggal } from "./format-date";

/**
 * Label kategori dipisah dari nilai enum koleksi. Nilai enum ikut masuk
 * query string dan slug kalau kelak ada penyaringan; labelnya yang boleh
 * berubah tanpa memindahkan data.
 */
export const CATEGORY_LABELS: Record<string, string> = {
  operasi: "Operasi",
  armada: "Armada",
  keselamatan: "Keselamatan",
  perusahaan: "Perusahaan",
};

/**
 * Relasi Payload mengembalikan angka saat depth 0 dan objek saat depth
 * lebih tinggi. Query artikel memakai depth 1, tapi komponen tetap
 * menangani bentuk angka supaya ia tidak crash kalau dipanggil dari
 * pemanggil dengan depth berbeda.
 */
export function resolveMedia(value: Post["coverImage"]): Media | null {
  return typeof value === "object" && value !== null ? (value as Media) : null;
}

function Meta({ post }: { post: Post }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-ink-muted">
      <span>{CATEGORY_LABELS[post.category] ?? post.category}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={post.publishedAt}>{formatTanggal(post.publishedAt)}</time>
    </p>
  );
}

function Sorotan({ post }: { post: Post }) {
  const cover = resolveMedia(post.coverImage);
  return (
    <article data-testid="artikel-sorotan" className="border-b border-surface-3 pb-12">
      <Link href={`/artikel/${post.slug}`} className="group block">
        {cover?.url ? (
          <Image
            src={cover.url}
            alt={cover.alt ?? ""}
            width={cover.width ?? 1600}
            height={cover.height ?? 900}
            sizes="(min-width: 1400px) 1400px, 100vw"
            className="aspect-[16/9] w-full rounded-card object-cover"
          />
        ) : null}
        <div className="mt-6">
          <Meta post={post} />
          <h2 className="mt-3 max-w-[24ch] font-display text-pretty text-3xl font-bold text-ink transition-colors group-hover:text-accent md:text-4xl">
            {post.title}
          </h2>
          <p className="mt-4 max-w-[60ch] text-ink-muted">{post.excerpt}</p>
        </div>
      </Link>
    </article>
  );
}

function Baris({ post }: { post: Post }) {
  const cover = resolveMedia(post.coverImage);
  return (
    <article data-testid="artikel-baris" className="py-8">
      <Link href={`/artikel/${post.slug}`} className="group flex items-start gap-6">
        {cover?.url ? (
          <Image
            src={cover.url}
            alt={cover.alt ?? ""}
            width={cover.width ?? 1600}
            height={cover.height ?? 900}
            sizes="160px"
            className="hidden aspect-[4/3] w-40 shrink-0 rounded-card object-cover sm:block"
          />
        ) : null}
        <div>
          <Meta post={post} />
          <h3 className="mt-2 max-w-[40ch] font-display text-pretty text-xl font-bold text-ink transition-colors group-hover:text-accent md:text-2xl">
            {post.title}
          </h3>
        </div>
      </Link>
    </article>
  );
}

export function ArticleList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <div className="mt-10 max-w-[60ch] rounded-card border border-surface-3 bg-surface-2 p-8">
        <p className="text-ink">Belum ada artikel</p>
        <p className="mt-3 text-sm text-ink-muted">
          Kabar operasi, armada, dan keselamatan akan terbit di halaman ini.
        </p>
      </div>
    );
  }

  // posts.length > 0 sudah dijamin oleh early return di atas, tapi
  // noUncheckedIndexedAccess membuat destructuring array tetap mengetik
  // elemen pertama sebagai Post | undefined.
  const [sorotan, ...sisanya] = posts as [Post, ...Post[]];
  return (
    <div className="mt-10">
      <Sorotan post={sorotan} />
      {sisanya.length > 0 ? (
        <div className="divide-y divide-surface-3">
          {sisanya.map((post) => (
            <Baris key={post.id} post={post} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
