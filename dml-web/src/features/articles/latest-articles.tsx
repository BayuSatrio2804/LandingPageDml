import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/payload/payload-types";
import { SectionHeader } from "@/components/ui/section-header";
import { CtaLink } from "@/components/ui/cta-link";
import { formatTanggal } from "./format-date";
import { resolveMedia, CATEGORY_LABELS } from "./article-list";

const JUMLAH = 3;

/**
 * Dipisah dari komponen async di bawah supaya tes render tidak perlu
 * menyentuh database sama sekali. Yang diuji bentuknya; yang menyentuh
 * Payload cuma pembungkus tiga baris.
 */
export function LatestArticlesView({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="bg-surface-wash py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader
            title="Artikel Terbaru"
            description="Kabar operasi, armada, dan keselamatan dari lapangan."
          />
          <CtaLink href="/artikel" variant="ghost">
            Semua Artikel
          </CtaLink>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {posts.slice(0, JUMLAH).map((post) => {
            const cover = resolveMedia(post.coverImage);
            return (
              <article key={post.id} data-testid="artikel-terbaru">
                <Link href={`/artikel/${post.slug}`} className="group block">
                  {cover?.url ? (
                    <Image
                      src={cover.url}
                      alt={cover.alt ?? ""}
                      width={cover.width ?? 1600}
                      height={cover.height ?? 900}
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="aspect-[4/3] w-full rounded-card object-cover"
                    />
                  ) : null}
                  <p className="mt-5 flex flex-wrap items-center gap-x-3 font-mono text-xs text-ink-muted">
                    <span>{CATEGORY_LABELS[post.category] ?? post.category}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={post.publishedAt}>{formatTanggal(post.publishedAt)}</time>
                  </p>
                  <h3 className="mt-2 font-display text-pretty text-xl font-bold text-ink transition-colors group-hover:text-accent">
                    {post.title}
                  </h3>
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export async function LatestArticles() {
  /**
   * Impor dinamis, bukan impor di kepala berkas. queries.ts memuat
   * @payload-config, dan vitest mengalias itu ke config Payload sungguhan.
   * Impor statis berarti tes render di jsdom ikut memuat seluruh config CMS
   * hanya untuk memeriksa markup. Menundanya ke sini membuat modul itu tidak
   * pernah dievaluasi selama tes komponen.
   */
  const { listPublishedPosts } = await import("./queries");
  const posts = await listPublishedPosts(JUMLAH);
  return <LatestArticlesView posts={posts} />;
}
