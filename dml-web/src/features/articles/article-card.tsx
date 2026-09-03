import Image from "next/image";
import Link from "next/link";
import type { ArticleCard as ArticleCardData } from "./types";

/**
 * Kartu artikel. Server component: tidak ada state, dan hover ditangani CSS.
 *
 * Dua keadaan foto disengaja. Artikel tanpa `coverImage` mendapat penampung
 * bergaris yang MENYEBUT dirinya menunggu foto, bukan gambar pengganti yang
 * terlihat final — admin bisa menerbitkan tulisan yang sudah siap tanpa
 * menahannya karena fotonya belum ada.
 */
export function ArticleCard({ article }: { article: ArticleCardData }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-[14px] border border-accent-soft bg-surface-2 transition-[transform,border-color,box-shadow] duration-450 hover:-translate-y-1.5 hover:border-surface-3 hover:shadow-[0_26px_52px_-38px_rgb(15_27_46/0.55)]">
      <Link href={`/artikel/${article.slug}`} className="flex flex-1 flex-col text-inherit">
        {article.image ? (
          <div className="relative aspect-16/10 overflow-hidden bg-hero-ground">
            <Image
              src={article.image.url}
              alt={article.image.alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-106"
            />
          </div>
        ) : (
          <div className="relative grid aspect-16/10 place-items-center bg-accent-soft [background-image:repeating-linear-gradient(135deg,var(--color-surface-3)_0_1px,transparent_1px_11px)]">
            <span className="rounded-full bg-surface-2/90 px-3.75 py-1.75 font-mono text-[10px] tracking-[0.16em] text-line uppercase">
              Foto menyusul
            </span>
          </div>
        )}

        <div className="flex flex-1 flex-col gap-3 p-6">
          <div className="flex flex-wrap items-center gap-2.75 font-mono text-[10px] tracking-[0.14em] text-line uppercase">
            <span className="rounded-full bg-surface px-3 py-1.25 text-accent">
              {article.categoryName}
            </span>
            <span>{article.readingMinutes} menit</span>
          </div>
          <h3 className="m-0 font-display text-[1.15rem] leading-[1.24] font-bold tracking-[-0.015em] text-ink text-pretty">
            {article.title}
          </h3>
          <p className="m-0 flex-1 text-sm leading-[1.66] text-ink-muted">{article.excerpt}</p>
          <div className="flex items-center justify-between gap-3 border-t border-accent-soft pt-3.5">
            <span className="font-mono text-[11px] text-line">{article.dateLabel}</span>
            <span
              aria-hidden="true"
              className="text-base text-accent transition-transform duration-400 group-hover:translate-x-1.25"
            >
              →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
