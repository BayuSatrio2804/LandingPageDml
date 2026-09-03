"use client";

import { gsap } from "@/lib/motion/gsap";
import type { CoreValue } from "@/content/types";
import { useSectionMotion } from "@/lib/motion/use-section-motion";
import { revealBatch } from "@/lib/motion/reveal-batch";

/**
 * Susunan radial: dua kartu mengapit medali DML, satu kartu di bawahnya.
 * `side` menentukan arah geser saat kartu disorot — tanpa itu kartu kanan
 * bergerak menimpa medali.
 */
const SIDES = ["kiri", "kanan", "bawah"] as const;
const HEAD_TONE = ["bg-accent", "bg-line", "bg-accent-lift"] as const;

export function CoreValues({ values }: { values: CoreValue[] }) {
  const root = useSectionMotion<HTMLElement>((scope) => {
    revealBatch(scope);
  });

  const hover = (on: boolean) => (event: React.MouseEvent<HTMLElement>) => {
    const card = event.currentTarget;
    const side = card.getAttribute("data-side");
    gsap.to(card, {
      x: on ? (side === "kiri" ? -10 : side === "kanan" ? 10 : 0) : 0,
      y: on ? (side === "bawah" ? 10 : 0) : 0,
      boxShadow: on
        ? "0 30px 60px -34px rgb(15 27 46 / 0.62)"
        : "0 24px 50px -40px rgb(15 27 46 / 0.5)",
      duration: 0.5,
      ease: "power3.out",
    });
    const letter = card.querySelector("[data-letter]");
    if (letter) gsap.to(letter, { opacity: on ? 1 : 0.42, duration: 0.4 });
  };

  return (
    <section
      ref={root}
      id="nilai"
      data-index-section="nilai"
      aria-labelledby="values-title"
      className="relative overflow-hidden bg-surface py-28"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(48%_52%_at_50%_46%,var(--color-surface-2)_0%,transparent_68%)]"
      />
      {/* Watermark tipografi, bukan gambar: skalanya bebas dan tidak menambah beban unduh. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-1/2 font-display text-[clamp(22rem,42vw,44rem)] leading-none font-bold tracking-[-0.06em] whitespace-nowrap text-accent opacity-[0.028] select-none"
      >
        DML
      </span>

      <div className="relative mx-auto max-w-350 px-8">
        <h2
          id="values-title"
          data-reveal="clip"
          className="m-0 text-center font-display text-[clamp(1.9rem,3.2vw,2.85rem)] leading-[1.05] font-bold tracking-[-0.02em] text-ink"
        >
          Nilai Inti
        </h2>
        <p data-reveal="" className="mx-auto mt-4.5 mb-0 max-w-[52ch] text-center text-base leading-[1.7] text-ink-muted">
          Nama perusahaan disingkat DML, dan ketiga hurufnya dipakai sebagai ukuran kerja seluruh
          awak kapal dan staf kantor.
        </p>

        <div className="mt-16 grid grid-cols-[1fr_300px_1fr] items-center gap-9 max-lg:grid-cols-1 max-lg:gap-6">
          <ValueCard value={values[0]} index={0} onEnter={hover(true)} onLeave={hover(false)} />

          <div className="relative order-none grid aspect-square place-items-center max-lg:order-first max-lg:mx-auto max-lg:max-w-65">
            <span aria-hidden="true" className="absolute inset-0 rounded-full border border-surface-3" />
            <span aria-hidden="true" className="absolute inset-[9%] rounded-full border border-surface-3/70" />
            <div className="grid size-[74%] place-items-center rounded-full bg-dark-field text-center">
              <div>
                <p className="m-0 font-display text-[clamp(2.5rem,4vw,3.25rem)] leading-none font-bold tracking-[0.06em] text-on-accent">
                  DML
                </p>
                <p className="mt-3 mb-0 font-mono text-[10px] tracking-[0.24em] text-surface-3 uppercase">
                  Nilai inti
                </p>
              </div>
            </div>
          </div>

          <ValueCard value={values[1]} index={1} onEnter={hover(true)} onLeave={hover(false)} />

          <div className="max-lg:hidden" />
          <ValueCard value={values[2]} index={2} onEnter={hover(true)} onLeave={hover(false)} />
          <div className="max-lg:hidden" />
        </div>
      </div>
    </section>
  );
}

function ValueCard({
  value,
  index,
  onEnter,
  onLeave,
}: {
  value: CoreValue | undefined;
  index: number;
  onEnter: (e: React.MouseEvent<HTMLElement>) => void;
  onLeave: (e: React.MouseEvent<HTMLElement>) => void;
}) {
  const side = SIDES[index];
  const align =
    side === "kiri" ? "text-right" : side === "bawah" ? "text-center" : "text-left";
  const headAlign =
    side === "kiri" ? "justify-end" : side === "bawah" ? "justify-center" : "justify-start";

  return (
    <article
      data-side={side}
      data-reveal=""
      data-reveal-group="value"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="overflow-hidden rounded-[14px] bg-surface-2 shadow-[0_24px_50px_-40px_rgb(15_27_46/0.5)]"
    >
      <p
        className={`m-0 flex items-center gap-3.5 px-6.5 py-4 font-display text-[17px] font-bold text-on-accent ${HEAD_TONE[index]} ${headAlign} max-lg:justify-start`}
      >
        {side === "kiri" ? (
          <>
            {value?.term}
            <span data-letter="" aria-hidden="true" className="text-[22px] leading-none opacity-42">
              {value?.key}
            </span>
          </>
        ) : (
          <>
            <span data-letter="" aria-hidden="true" className="text-[22px] leading-none opacity-42">
              {value?.key}
            </span>
            {value?.term}
          </>
        )}
      </p>
      <p className={`m-0 p-6.5 text-[15px] leading-[1.72] text-ink-muted max-lg:text-left ${align}`}>
        {value?.description}
      </p>
    </article>
  );
}
