"use client";

import Image from "next/image";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { useSectionMotion } from "@/lib/motion/use-section-motion";
import { revealBatch } from "@/lib/motion/reveal-batch";
import type { ArticleCard as ArticleCardData } from "./types";

/**
 * Artikel unggulan, menjorok ke atas menembus batas seksi kepala. Karena itu
 * seksi ini memakai translate negatif dan tidak boleh dibungkus elemen
 * ber-overflow-hidden.
 */
export function FeaturedArticle({ article }: { article: ArticleCardData }) {
  const root = useSectionMotion<HTMLElement>((scope) => {
    const q = gsap.utils.selector(scope);
    revealBatch(scope);

    const frame = q("[data-frame]")[0];
    const image = q("[data-parallax]")[0];
    if (frame) {
      gsap.fromTo(
        frame,
        { clipPath: "inset(0% 0% 100% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.1,
          ease: "expo.out",
          scrollTrigger: { trigger: frame, start: "top 92%", once: true },
        },
      );
    }
    if (image) {
      gsap.set(image, { scale: 1.12 });
      ScrollTrigger.create({
        trigger: frame ?? image,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => gsap.set(image, { y: (self.progress - 0.5) * 38 }),
      });
    }
  });

  return (
    <section ref={root} aria-labelledby="featured-title" className="relative bg-surface-2 pb-18">
      <div className="mx-auto max-w-350 px-8">
        <h2 id="featured-title" className="sr-only">
          Artikel unggulan
        </h2>
        <article
          data-reveal=""
          className="grid -translate-y-9 grid-cols-[1.15fr_1fr] overflow-hidden rounded-2xl bg-hero-ground shadow-[0_34px_70px_-50px_rgb(15_27_46/0.65)] max-lg:grid-cols-1"
        >
          <div data-frame="" className="relative min-h-105 overflow-hidden max-lg:min-h-0 max-lg:aspect-16/9">
            {article.image ? (
              <Image
                data-parallax=""
                src={article.image.url}
                alt={article.image.alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-dark-field [background-image:repeating-linear-gradient(135deg,rgb(255_255_255/0.06)_0_1px,transparent_1px_12px)]" />
            )}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-linear-120 from-hero-ground/15 to-hero-ground/50"
            />
            <span className="absolute top-5.5 left-5.5 rounded-full bg-hero-ground/72 px-4 py-2 font-mono text-[11px] tracking-[0.16em] text-on-accent uppercase">
              Unggulan
            </span>
          </div>

          <div className="flex flex-col justify-center gap-5 p-[clamp(2rem,3.4vw,3.5rem)]">
            <div className="flex flex-wrap items-center gap-3.5 font-mono text-[11px] tracking-[0.14em] text-surface-3 uppercase">
              <span className="rounded-full bg-accent-lift/22 px-3.25 py-1.5 text-accent-soft">
                {article.categoryName}
              </span>
              <span>{article.dateLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{article.readingMinutes} menit baca</span>
            </div>
            <h3 className="m-0 max-w-[26ch] font-display text-[clamp(1.6rem,2.7vw,2.35rem)] leading-[1.08] font-bold tracking-[-0.02em] text-on-accent text-pretty">
              {article.title}
            </h3>
            <p className="m-0 max-w-[46ch] text-base leading-[1.72] text-on-accent/78">
              {article.excerpt}
            </p>
            <div>
              <Link
                href={`/artikel/${article.slug}`}
                className="inline-flex items-center gap-2.5 rounded-full bg-surface-2 px-6.5 py-3.25 text-sm font-medium text-accent transition-all hover:gap-4 hover:bg-on-accent hover:text-accent-hover"
              >
                Baca artikel <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
