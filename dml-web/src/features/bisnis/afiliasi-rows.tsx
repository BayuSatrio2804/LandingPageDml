"use client";

import { gsap } from "@/lib/motion/gsap";
import type { BusinessLine } from "@/content/types";
import { MOTION } from "@/lib/motion/tokens";
import { useSectionMotion } from "@/lib/motion/use-section-motion";

export function AfiliasiRows({ affiliates }: { affiliates: BusinessLine[] }) {
  const root = useSectionMotion<HTMLElement>((scope) => {
    const q = gsap.utils.selector(scope);

    q("[data-affiliate-row]").forEach((row, index) => {
      gsap.fromTo(
        row,
        { y: 22, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: MOTION.base,
          ease: MOTION.ease,
          delay: index * 0.09,
          clearProps: "transform,opacity,visibility",
          scrollTrigger: { trigger: row, start: "top 92%", once: true },
        },
      );
    });

    q("[data-reveal-clip]").forEach((el) => {
      gsap.fromTo(
        el,
        { clipPath: "inset(0% 0% 100% 0%)", y: 26 },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          y: 0,
          duration: MOTION.slow,
          ease: "expo.out",
          clearProps: "clipPath,transform",
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        },
      );
    });
  });

  /*
   * Hover ditangani lewat GSAP, bukan class Tailwind, karena tiga hal bergerak
   * bersamaan dengan easing berbeda: sapuan tint (expo.out), angka (power2),
   * dan panah. Menuliskannya sebagai hover: variant berarti tiga transition
   * CSS yang harus dijaga tetap sinkron.
   */
  const setHover = (on: boolean) => (event: React.MouseEvent<HTMLElement>) => {
    const row = event.currentTarget;
    const wipe = row.querySelector<HTMLElement>("[data-row-wipe]");
    const num = row.querySelector<HTMLElement>("[data-row-num]");
    const arrow = row.querySelector<HTMLElement>("[data-row-arrow]");
    if (wipe) {
      gsap.to(wipe, {
        scaleX: on ? 1 : 0,
        duration: on ? 0.55 : 0.35,
        ease: on ? "expo.out" : "power2.in",
      });
    }
    if (num) {
      gsap.to(num, {
        color: on ? "var(--color-accent)" : "var(--color-surface-3)",
        x: on ? 8 : 0,
        duration: 0.45,
        ease: MOTION.ease,
      });
    }
    if (arrow) gsap.to(arrow, { opacity: on ? 1 : 0, x: on ? 0 : -10, duration: 0.4 });
  };

  return (
    <section
      ref={root}
      id="afiliasi"
      data-index-section="afiliasi"
      aria-labelledby="afiliasi-title"
      className="relative bg-surface py-30"
    >
      <div className="mx-auto max-w-350 px-8">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="m-0 font-mono text-[11px] tracking-[0.2em] text-ink-muted uppercase">
              03 · Sinar Alam Corporation
            </p>
            <h2
              id="afiliasi-title"
              data-reveal-clip=""
              className="mt-3.5 mb-0 font-display text-[clamp(2rem,3.6vw,3.25rem)] leading-[1.03] font-bold tracking-[-0.02em] text-ink text-pretty"
            >
              Perusahaan afiliasi
            </h2>
          </div>
          <p className="m-0 max-w-[40ch] text-[15px] leading-relaxed text-ink-muted">
            Tiga perusahaan yang berdiri sendiri di dalam grup, tidak dijalankan DML.
          </p>
        </div>

        <div className="mt-14 border-t border-surface-3">
          {affiliates.map((affiliate, index) => (
            <article
              key={affiliate.id}
              data-affiliate-row=""
              onMouseEnter={setHover(true)}
              onMouseLeave={setHover(false)}
              className="relative overflow-hidden border-b border-surface-3"
            >
              <span
                data-row-wipe=""
                aria-hidden="true"
                className="absolute inset-0 origin-left scale-x-0 bg-accent/6"
              />
              <div className="relative grid grid-cols-[118px_1fr_auto] items-center gap-8 px-2.5 py-10 max-sm:grid-cols-1 max-sm:gap-4">
                <span
                  data-row-num=""
                  aria-hidden="true"
                  className="font-display text-[clamp(2.75rem,5vw,5rem)] leading-[0.9] font-bold text-surface-3"
                >
                  {String(index + 3).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="m-0 font-display text-[clamp(1.25rem,2vw,1.75rem)] font-bold text-ink text-pretty">
                    {affiliate.title}
                  </h3>
                  <p className="mt-2.5 mb-0 max-w-[58ch] leading-relaxed text-ink-muted">
                    {affiliate.summary}
                  </p>
                  <ul className="mt-4 flex list-none flex-wrap gap-2.5 p-0">
                    {affiliate.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="rounded-full border border-surface-3 px-3.5 py-1.5 font-mono text-xs text-ink"
                      >
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
                <span
                  data-row-arrow=""
                  aria-hidden="true"
                  className="-translate-x-2.5 text-[22px] text-accent opacity-0 max-sm:hidden"
                >
                  →
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
