"use client";

import Image from "next/image";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { MEDIA, avifSrc } from "@/lib/media/manifest";
import { useSectionMotion } from "@/lib/motion/use-section-motion";
import { revealBatch } from "@/lib/motion/reveal-batch";
import { ABOUT_PAGE_DEFAULTS, type AboutPageData } from "./about-defaults";

const HERO = MEDIA.hari.find((asset) => asset.id === "dji-0030")!;

export function AboutHero({
  copy = ABOUT_PAGE_DEFAULTS.hero,
}: {
  copy?: AboutPageData["hero"];
}) {
  const titleWords = copy.title.split(/\s+/).filter(Boolean);
  const root = useSectionMotion<HTMLElement>((scope) => {
    const q = gsap.utils.selector(scope);
    revealBatch(scope);

    // Judul masuk per kata. Tiap kata sudah punya pembungkus overflow-hidden di
    // markup, jadi tidak perlu memecah baris sendiri — aman saat GT America
    // Extended baru selesai dimuat dan tinggi barisnya berubah.
    gsap.fromTo(
      q("[data-word]"),
      { yPercent: 115 },
      { yPercent: 0, duration: 1.05, ease: "expo.out", stagger: 0.055, delay: 0.22 },
    );

    const image = q("[data-hero-img]")[0];
    if (!image) return;
    gsap.fromTo(image, { scale: 1.15 }, { scale: 1.03, duration: 2.2, ease: "power2.out" });
    ScrollTrigger.create({
      trigger: scope,
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => gsap.set(image, { y: self.progress * 70 }),
    });
  });

  return (
    <section
      ref={root}
      aria-labelledby="about-hero-title"
      className="relative -mt-18 overflow-hidden bg-hero-ground"
    >
      {/*
        Foto membias dari kanan, bukan penuh: kolom kiri harus tetap gelap rata
        supaya judul dan dua paragraf pengantar terbaca tanpa scrim tambahan.
        Di layar sempit foto melebar penuh dan scrim-nya diperdalam.
      */}
      <div aria-hidden="true" className="absolute inset-0 left-[34%] max-md:left-0">
        <Image
          data-hero-img=""
          src={avifSrc(HERO, 1600)}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover [transform-origin:60%_46%]"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-100 from-hero-ground from-30% via-hero-ground/85 via-46% to-hero-ground/25 max-md:bg-hero-ground/85"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-b from-hero-ground/50 via-transparent to-surface"
      />

      <div className="relative mx-auto max-w-350 px-8 pt-14 pb-33">
        <nav aria-label="Breadcrumb" data-reveal="">
          <ol className="flex list-none gap-2.5 p-0 text-[13px] text-on-accent/58">
            <li>
              <Link href="/" className="text-on-accent/58 transition-colors hover:text-on-accent">
                Beranda
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-on-accent/90">Tentang Kami</li>
          </ol>
        </nav>

        <h1
          id="about-hero-title"
          className="mt-6.5 mb-0 flex max-w-[17ch] flex-wrap gap-x-[0.26em] font-display text-[clamp(2.25rem,4.4vw,3.9rem)] leading-[1.06] font-bold tracking-[-0.025em] text-on-accent"
        >
          {titleWords.map((word, i) => (
            <span key={`${word}-${i}`} className="block overflow-hidden pb-[0.1em]">
              <span data-word="" className="block">
                {word}
              </span>
            </span>
          ))}
        </h1>

        <div className="mt-8.5 flex max-w-[56ch] flex-col gap-5.5">
          <p data-reveal="" className="m-0 text-base leading-[1.78] text-on-accent/80">
            {copy.intro1}
          </p>
          <p data-reveal="" className="m-0 text-base leading-[1.78] text-on-accent/72">
            {copy.intro2}
          </p>
        </div>
      </div>
    </section>
  );
}
