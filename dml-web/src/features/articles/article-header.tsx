"use client";

import Image from "next/image";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { useSectionMotion } from "@/lib/motion/use-section-motion";
import { revealBatch } from "@/lib/motion/reveal-batch";
import type { ArticleCard } from "./types";

export function ArticleHeader({ article }: { article: ArticleCard }) {
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
        onUpdate: (self) => gsap.set(image, { y: (self.progress - 0.5) * 40 }),
      });
    }
  });

  return (
    <section
      ref={root}
      aria-labelledby="article-title"
      className="relative overflow-hidden bg-hero-ground pt-16"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(58%_66%_at_50%_0%,rgb(91_132_200/0.2)_0%,transparent_64%)]"
      />
      <div className="relative mx-auto max-w-225 px-8">
        <nav aria-label="Breadcrumb">
          <ol data-reveal="" className="flex list-none flex-wrap gap-2.5 p-0 text-[13px] text-on-accent/58">
            <li>
              <Link href="/" className="text-on-accent/58 transition-colors hover:text-on-accent">
                Beranda
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/artikel" className="text-on-accent/58 transition-colors hover:text-on-accent">
                Artikel
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-on-accent/90">{article.categoryName}</li>
          </ol>
        </nav>

        <div
          data-reveal=""
          className="mt-6.5 flex flex-wrap items-center gap-3.5 font-mono text-[11px] tracking-[0.14em] text-surface-3 uppercase"
        >
          <span className="rounded-full bg-accent-lift/22 px-3.25 py-1.5 text-accent-soft">
            {article.categoryName}
          </span>
          <span>{article.dateLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{article.readingMinutes} menit baca</span>
        </div>

        <h1
          id="article-title"
          data-reveal="clip"
          className="mt-6 mb-0 font-display text-[clamp(2rem,4vw,3.15rem)] leading-[1.06] font-bold tracking-[-0.025em] text-on-accent text-pretty"
        >
          {article.title}
        </h1>

        <p data-reveal="" className="mt-6 mb-0 max-w-[60ch] text-[19px] leading-[1.72] text-on-accent/80">
          {article.excerpt}
        </p>

        <div className="h-16" />
      </div>

      {article.image ? (
        <div className="relative mx-auto max-w-350 px-8">
          <div
            data-frame=""
            className="relative aspect-21/9 overflow-hidden rounded-t-2xl bg-dark-field max-md:aspect-16/9"
          >
            <Image
              data-parallax=""
              src={article.image.url}
              alt={article.image.alt}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
