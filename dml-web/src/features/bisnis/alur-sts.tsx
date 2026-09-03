"use client";

import Image from "next/image";
import { useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { MEDIA, avifSrc } from "@/lib/media/manifest";
import { MOTION } from "@/lib/motion/tokens";
import { useSectionMotion } from "@/lib/motion/use-section-motion";
import { BISNIS_PAGE_DEFAULTS, type BisnisPageData } from "./bisnis-defaults";

export function AlurSts({
  copy = BISNIS_PAGE_DEFAULTS.alurSts,
}: {
  copy?: BisnisPageData["alurSts"];
}) {
  const STEPS = MEDIA["alur-sts"].map((asset, index) => ({
    id: asset.id,
    num: String(index + 1).padStart(2, "0"),
    asset,
    title: copy.steps[index]?.title ?? BISNIS_PAGE_DEFAULTS.alurSts.steps[index]?.title ?? "",
    desc: copy.steps[index]?.desc ?? BISNIS_PAGE_DEFAULTS.alurSts.steps[index]?.desc ?? "",
  }));
  // Tahap aktif disimpan di state React, bukan ditulis langsung ke DOM,
  // supaya nomor besar di kolom sticky tetap benar kalau komponen dirender
  // ulang di tengah scroll.
  const [active, setActive] = useState(0);
  // STEPS berasal dari MEDIA["alur-sts"], selalu 3 elemen tetap; TS tidak
  // tahu itu karena noUncheckedIndexedAccess, jadi fallback ke elemen
  // pertama murni untuk memuaskan pemeriksa tipe, bukan kondisi nyata.
  const currentStep = STEPS[active] ?? STEPS[0]!;

  const root = useSectionMotion<HTMLElement>((scope) => {
    const q = gsap.utils.selector(scope);

    q("[data-sts-figure]").forEach((figure, index) => {
      const image = figure.querySelector<HTMLElement>("[data-sts-img]");
      const dot = figure.querySelector<HTMLElement>("[data-sts-dot]");
      const frame = figure.querySelector<HTMLElement>("[data-sts-frame]");

      // Zigzag diberikan lewat gsap.set, bukan class, supaya offset-nya
      // hilang sendiri ketika gerak dikurangi (context tidak pernah jalan).
      gsap.set(figure, { x: index % 2 === 1 ? 56 : 0 });

      if (frame) {
        gsap.set(frame, { clipPath: "inset(0% 0% 100% 0%)" });
        ScrollTrigger.create({
          trigger: figure,
          start: "top 86%",
          once: true,
          onEnter: () =>
            gsap.to(frame, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.15, ease: "expo.out" }),
        });
      }

      if (image) {
        gsap.set(image, { scale: 1.12 });
        ScrollTrigger.create({
          trigger: figure,
          start: "top bottom",
          end: "bottom top",
          scrub: MOTION.scrub,
          onUpdate: (self) => gsap.set(image, { y: (self.progress - 0.5) * 46 }),
        });
      }

      ScrollTrigger.create({
        trigger: figure,
        start: "top 62%",
        end: "bottom 38%",
        onToggle: (self) => {
          if (dot) {
            gsap.to(dot, {
              backgroundColor: self.isActive ? "var(--color-accent)" : "var(--color-surface-2)",
              borderColor: self.isActive ? "var(--color-accent)" : "var(--color-surface-3)",
              scale: self.isActive ? 1.35 : 1,
              duration: MOTION.fast,
              ease: MOTION.ease,
            });
          }
          if (self.isActive) setActive(index);
        },
      });
    });

    const flow = q("[data-sts-flow]")[0];
    const column = q("[data-sts-column]")[0];
    if (flow && column) {
      ScrollTrigger.create({
        trigger: column,
        start: "top 70%",
        end: "bottom 55%",
        scrub: MOTION.scrub,
        onUpdate: (self) => gsap.set(flow, { height: `${self.progress * 100}%` }),
      });
    }
  });

  return (
    <section
      ref={root}
      id="sts"
      data-index-section="sts"
      aria-labelledby="sts-title"
      className="relative bg-surface-2 py-30"
    >
      <div className="mx-auto grid max-w-350 grid-cols-[1fr_1.35fr] gap-16 px-8 max-lg:grid-cols-1 max-lg:gap-10">
        <div className="sticky top-30 self-start max-lg:static">
          <p className="m-0 font-mono text-[11px] tracking-[0.2em] text-ink-muted uppercase">
            {copy.kicker}
          </p>
          <h2
            id="sts-title"
            className="mt-3.5 mb-0 font-display text-[clamp(2rem,3.6vw,3.25rem)] leading-[1.03] font-bold tracking-[-0.02em] text-ink text-pretty"
          >
            {copy.heading}
          </h2>
          <p className="mt-5 mb-0 max-w-[38ch] leading-relaxed text-ink-muted">{copy.intro}</p>

          <div className="mt-11 flex items-end gap-4" aria-live="polite">
            <span
              key={active}
              className="animate-[fade-up_0.45s_ease-out] font-display text-[clamp(4rem,7vw,7rem)] leading-[0.82] font-bold tracking-[-0.03em] text-accent"
            >
              {currentStep.num}
            </span>
            <div className="pb-2.5">
              <p className="m-0 font-display text-[17px] font-bold text-ink">{currentStep.title}</p>
              <p className="mt-1.5 mb-0 font-mono text-[11px] tracking-[0.16em] text-line uppercase">
                Tahap {active + 1} dari 3
              </p>
            </div>
          </div>

          <p className="mt-8 mb-0 font-mono text-xs text-line">Terminal → laut lepas → titik serah</p>
        </div>

        {/*
          Garis alur diletakkan absolute di belakang kolom foto, jadi ia tidak
          pernah mendorong layout gambarnya saat tingginya dianimasikan.
        */}
        <div data-sts-column="" className="relative pl-14 max-lg:pl-10">
          <span aria-hidden="true" className="absolute top-2 bottom-2 left-3.5 w-px bg-surface-3" />
          <span
            data-sts-flow=""
            aria-hidden="true"
            className="absolute top-2 left-3.5 h-0 w-px origin-top bg-accent"
          />

          <ol className="m-0 flex list-none flex-col gap-21 p-0">
            {STEPS.map((step) => (
              <li key={step.id}>
                <figure data-sts-figure="" className="relative m-0 max-w-135">
                  <span
                    data-sts-dot=""
                    aria-hidden="true"
                    className="absolute top-3.5 -left-11.5 block size-2.75 rounded-full border border-surface-3 bg-surface-2"
                  />
                  <div
                    data-sts-frame=""
                    className="relative aspect-4/3 overflow-hidden rounded-sm bg-hero-ground"
                  >
                    <Image
                      data-sts-img=""
                      src={avifSrc(step.asset, 1080)}
                      alt={step.asset.alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 540px"
                      className="object-cover"
                    />
                    <span className="absolute top-4.5 left-4.5 font-mono text-[11px] tracking-[0.22em] text-on-accent [text-shadow:0_1px_8px_rgb(4_10_24/0.7)]">
                      {step.num}
                    </span>
                  </div>
                  <figcaption className="mt-4.5">
                    <p className="m-0 font-display text-[19px] font-bold text-ink">{step.title}</p>
                    <p className="mt-2 mb-0 max-w-[40ch] text-sm leading-relaxed text-ink-muted">
                      {step.desc}
                    </p>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
