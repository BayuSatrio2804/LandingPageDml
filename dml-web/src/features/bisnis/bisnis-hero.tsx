"use client";

import Image from "next/image";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { MEDIA, avifSrc } from "@/lib/media/manifest";
import { MOTION } from "@/lib/motion/tokens";
import { useSectionMotion } from "@/lib/motion/use-section-motion";
import { BISNIS_PAGE_DEFAULTS, type BisnisPageData } from "./bisnis-defaults";

const HERO = MEDIA.bisnis.find((asset) => asset.id === "hub-bisnis")!;

export function BisnisHero({
  copy = BISNIS_PAGE_DEFAULTS.hero,
}: {
  copy?: BisnisPageData["hero"];
}) {
  const titleWords = copy.title.split(/\s+/).filter(Boolean);
  const metrics = copy.metrics;
  const root = useSectionMotion<HTMLElement>((scope) => {
    const q = gsap.utils.selector(scope);

    // Judul masuk per kata. Tiap kata sudah punya pembungkus overflow-hidden
    // di markup, jadi tidak perlu memecah baris sendiri — aman saat GT America
    // Extended baru selesai dimuat dan tinggi barisnya berubah.
    gsap.fromTo(
      q("[data-hero-word]"),
      { yPercent: 115 },
      { yPercent: 0, duration: MOTION.slow, ease: "expo.out", stagger: 0.075, delay: 0.25 },
    );

    gsap.fromTo(
      q("[data-hero-meta]"),
      { y: 22, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: MOTION.base,
        ease: MOTION.ease,
        stagger: 0.08,
        delay: 0.45,
        clearProps: "transform,opacity,visibility",
      },
    );

    const image = q("[data-hero-img]")[0];
    if (image) {
      gsap.fromTo(image, { scale: 1.16 }, { scale: 1.04, duration: 2.4, ease: "power2.out" });
      ScrollTrigger.create({
        trigger: scope,
        start: "top top",
        end: "bottom top",
        scrub: MOTION.scrub,
        onUpdate: (self) => gsap.set(image, { y: self.progress * 90 }),
      });
    }

    // Angka berhitung dari dasar bukan-nol. Nilai akhirnya sudah tercetak di
    // markup, jadi ini murni penghias, bukan sumber datanya.
    q("[data-count]").forEach((el) => {
      const target = Number(el.getAttribute("data-count"));
      if (!target) return;
      const proxy = { v: Math.round(target * 0.4) };
      ScrollTrigger.create({
        trigger: el,
        start: "top 95%",
        once: true,
        onEnter: () =>
          gsap.to(proxy, {
            v: target,
            duration: MOTION.slow,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = String(Math.round(proxy.v));
            },
          }),
      });
    });

    gsap.to(q("[data-hero-cue]"), {
      y: 8,
      duration: 1.1,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });
  });

  return (
    <section
      ref={root}
      aria-labelledby="bisnis-hero-title"
      className="relative -mt-18 h-svh min-h-170 overflow-hidden bg-hero-ground"
    >
      <Image
        data-hero-img=""
        src={avifSrc(HERO, 1600)}
        alt={HERO.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover [transform-origin:52%_46%]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-hero-ground/95 via-hero-ground/60 to-hero-ground/40"
      />

      <div className="absolute inset-0 mx-auto flex max-w-350 flex-col justify-end gap-7 px-8 pb-18">
        <nav aria-label="Breadcrumb" data-hero-meta="">
          <ol className="flex list-none gap-2.5 p-0 font-mono text-[11px] tracking-[0.18em] text-on-accent/60 uppercase">
            <li>
              <Link href="/" className="text-on-accent/60 transition-colors hover:text-on-accent">
                Beranda
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-on-accent">Bisnis Kami</li>
          </ol>
        </nav>

        <h1
          id="bisnis-hero-title"
          className="m-0 flex max-w-[20ch] flex-wrap gap-x-[0.28em] font-display text-[clamp(2.75rem,6.4vw,6rem)] leading-[0.98] font-bold tracking-[-0.03em] text-on-accent"
        >
          {titleWords.map((word, i) => (
            <span key={`${word}-${i}`} className="block overflow-hidden pb-[0.06em]">
              <span data-hero-word="" className="block">
                {word}
              </span>
            </span>
          ))}
        </h1>

        <p data-hero-meta="" className="m-0 max-w-[52ch] text-lg leading-relaxed text-on-accent/80">
          {copy.intro}
        </p>

        <div className="flex flex-wrap items-end gap-12 border-t border-on-accent/20 pt-7">
          {metrics.map((metric, i) => (
            <div key={`${metric.label}-${i}`} data-hero-meta="">
              <p className="m-0 flex items-baseline gap-2">
                <span
                  data-count={metric.value}
                  className="font-display text-[clamp(2rem,3.2vw,2.75rem)] leading-none font-bold text-on-accent"
                >
                  {metric.value}
                </span>
                <span className="font-mono text-[11px] tracking-[0.16em] text-on-accent/60 uppercase">
                  {metric.unit}
                </span>
              </p>
              <p className="mt-2 mb-0 text-[13px] text-on-accent/72">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        data-hero-cue=""
        className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2.5"
      >
        <span aria-hidden="true" className="block h-px w-6.5 bg-on-accent/40" />
        <span className="font-mono text-[10px] tracking-[0.24em] text-on-accent/55 uppercase">
          Gulir
        </span>
      </div>
    </section>
  );
}
