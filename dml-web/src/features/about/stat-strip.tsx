"use client";

import { useSectionMotion } from "@/lib/motion/use-section-motion";
import { countUpBatch, revealBatch } from "@/lib/motion/reveal-batch";
import { yearsOperating } from "@/lib/company/years-operating";
import { ABOUT_PAGE_DEFAULTS, type AboutPageData } from "./about-defaults";

/**
 * Pita statistik menjorok ke atas menembus batas seksi hero, jadi jembatan
 * antara bidang gelap dan badan halaman terang. Karena itu ia punya margin
 * negatif dan tidak boleh dibungkus elemen ber-overflow-hidden.
 */
export function StatStrip({
  foundedIso,
  vessels,
  people,
  sektorCount,
  labels = ABOUT_PAGE_DEFAULTS.statLabels,
}: {
  foundedIso: string;
  vessels: number;
  people: number;
  sektorCount: number;
  labels?: AboutPageData["statLabels"];
}) {
  const root = useSectionMotion<HTMLElement>((scope) => {
    revealBatch(scope);
    countUpBatch(scope);
  });

  const years = yearsOperating(foundedIso, new Date());
  const stats = [
    { id: "tahun", value: years, unit: "Tahun", label: labels.years },
    { id: "kapal", value: vessels, unit: "Kapal", label: labels.ships },
    { id: "orang", value: people, prefix: ">", unit: "Orang", label: labels.people },
    { id: "sektor", value: sektorCount, unit: "Sektor", label: labels.sectors },
  ];

  return (
    <section ref={root} aria-label="Angka ringkas perusahaan" className="relative bg-surface pb-26">
      <div className="mx-auto max-w-350 px-8">
        <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] overflow-hidden rounded-[14px] bg-surface-2 shadow-[0_28px_60px_-44px_rgb(15_27_46/0.55)]">
          {stats.map((stat) => (
            <div
              key={stat.id}
              data-reveal=""
              data-reveal-group="stat"
              className="border-l border-accent-soft px-7 py-8 first:border-l-0"
            >
              <dd className="m-0 flex items-baseline gap-1.5">
                {"prefix" in stat && stat.prefix ? (
                  <span className="font-display text-2xl leading-none font-bold text-line">
                    {stat.prefix}
                  </span>
                ) : null}
                <span
                  data-count={stat.value}
                  className="font-display text-[clamp(2rem,3vw,2.6rem)] leading-none font-bold tracking-[-0.02em] text-accent"
                >
                  {stat.value}
                </span>
                <span className="font-mono text-[11px] tracking-[0.16em] text-ink-muted uppercase">
                  {stat.unit}
                </span>
              </dd>
              <dt className="mt-3 max-w-[22ch] text-[13px] leading-[1.55] text-ink-muted">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
