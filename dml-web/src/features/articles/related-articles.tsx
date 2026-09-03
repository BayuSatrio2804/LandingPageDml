"use client";

import Link from "next/link";
import { gsap } from "@/lib/motion/gsap";
import { useSectionMotion } from "@/lib/motion/use-section-motion";
import { revealBatch } from "@/lib/motion/reveal-batch";
import { ArticleCard } from "./article-card";
import type { ArticleCard as ArticleCardData } from "./types";

export function RelatedArticles({ articles }: { articles: ArticleCardData[] }) {
  const root = useSectionMotion<HTMLElement>((scope) => {
    revealBatch(scope);
    const cards = Array.from(scope.querySelectorAll<HTMLElement>("[data-related-grid] > *"));
    if (!cards.length) return;
    gsap.fromTo(
      cards,
      { y: 20, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.06,
        clearProps: "transform,opacity,visibility",
        scrollTrigger: { trigger: cards[0], start: "top 92%", once: true },
      },
    );
  });

  // Seksi ini tidak dirender sama sekali kalau tidak ada artikel lain: judul
  // "Artikel terkait" di atas ruang kosong lebih buruk daripada tidak ada.
  if (!articles.length) return null;

  return (
    <section
      ref={root}
      aria-labelledby="related-title"
      className="relative overflow-hidden bg-surface pt-24 pb-28"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(60%_64%_at_8%_10%,var(--color-surface-2)_0%,transparent_58%)]"
      />
      <div className="relative mx-auto max-w-350 px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-5 border-b border-surface-3 pb-5">
          <h2
            id="related-title"
            data-reveal="clip"
            className="m-0 font-display text-[clamp(1.35rem,2vw,1.75rem)] font-bold tracking-[-0.015em] text-ink"
          >
            Artikel terkait
          </h2>
          <Link
            href="/artikel"
            className="inline-flex items-center gap-2.25 text-sm font-medium text-accent transition-all hover:gap-3.5 hover:text-accent-hover"
          >
            Semua artikel <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div data-related-grid="" className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6.5">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
