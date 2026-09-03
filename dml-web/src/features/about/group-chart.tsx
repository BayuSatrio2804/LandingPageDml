"use client";

import { gsap } from "@/lib/motion/gsap";
import type { GroupUnit } from "@/content/types";
import { useSectionMotion } from "@/lib/motion/use-section-motion";
import { revealBatch } from "@/lib/motion/reveal-batch";

const ROW_SIZE = 3;
const GAP_PX = 28;

/**
 * Bagan grup: satu simpul induk, batang turun, lalu dua tingkat yang
 * masing-masing punya tulang mendatar sendiri dan dihubungkan rel menurun.
 *
 * Dibangun sebagai dua tingkat, BUKAN satu grid enam sel dengan satu tulang.
 * Dengan satu tulang, tiga kartu baris kedua menggambar garis turun ke ruang
 * kosong dan terlihat tidak tersambung ke apa pun.
 *
 * `groupUnits`/`dmlLegalName` diterima sebagai props, bukan import langsung
 * dari @/content/company: komponen ini "use client" dan datanya sekarang
 * datang dari CMS, jadi halaman Tentang Kami (server component) yang
 * mengambilnya lebih dulu.
 */
export function GroupChart({
  groupUnits,
  dmlLegalName,
}: {
  groupUnits: GroupUnit[];
  dmlLegalName: string;
}) {
  const rows = Array.from({ length: Math.ceil(groupUnits.length / ROW_SIZE) }, (_, i) =>
    groupUnits.slice(i * ROW_SIZE, i * ROW_SIZE + ROW_SIZE),
  );

  const root = useSectionMotion<HTMLElement>((scope) => {
    const q = gsap.utils.selector(scope);
    revealBatch(scope);

    const node = q("[data-node]")[0];
    const trunk = q("[data-trunk]")[0];
    if (!trunk) return;
    // Garis dianimasikan lewat scaleX/scaleY dengan transform-origin, bukan
    // width/height: yang kedua memicu layout ulang di setiap bingkai.
    const levels = q("[data-spine]").map((spine) => {
      const scopeEl = spine.parentElement as HTMLElement;
      return {
        spine,
        drops: scopeEl.querySelectorAll("[data-drop]"),
        rail: scopeEl.querySelector("[data-rail]"),
      };
    });

    gsap.set(trunk, { scaleY: 0 });
    levels.forEach((level) => {
      gsap.set(level.spine, { scaleX: 0 });
      gsap.set(level.drops, { scaleY: 0 });
      if (level.rail) gsap.set(level.rail, { scaleY: 0 });
    });
    if (node) gsap.set(node, { y: 18, autoAlpha: 0 });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: scope, start: "top 72%", once: true },
    });
    if (node) {
      tl.to(node, {
        y: 0,
        autoAlpha: 1,
        duration: 0.7,
        ease: "power3.out",
        clearProps: "transform,opacity,visibility",
      });
    }
    tl.to(trunk, { scaleY: 1, duration: 0.4, ease: "power2.out" }, "-=0.15");
    levels.forEach((level) => {
      tl.to(level.spine, { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, "-=0.05");
      tl.to(level.drops, { scaleY: 1, duration: 0.32, ease: "power2.out", stagger: 0.06 }, "-=0.22");
      if (level.rail) tl.to(level.rail, { scaleY: 1, duration: 0.35, ease: "power2.out" }, "+=0.05");
    });
  });

  const hover = (on: boolean) => (event: React.MouseEvent<HTMLElement>) => {
    const num = event.currentTarget.querySelector("[data-num]");
    if (num) {
      gsap.to(num, {
        color: on ? "var(--color-accent)" : "var(--color-line)",
        duration: 0.4,
        ease: "power2.out",
      });
    }
  };

  return (
    <section
      ref={root}
      id="struktur"
      data-index-section="struktur"
      aria-labelledby="chart-title"
      className="relative overflow-hidden bg-surface-2 pt-28 pb-31"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(70%_46%_at_50%_0%,var(--color-surface)_0%,transparent_58%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-55 [background-image:linear-gradient(90deg,var(--color-accent-soft)_1px,transparent_1px)] [background-size:112px_100%] [mask-image:radial-gradient(58%_58%_at_50%_42%,#000_0%,transparent_78%)]"
      />

      <div className="relative mx-auto max-w-350 px-8">
        <h2
          id="chart-title"
          data-reveal="clip"
          className="m-0 text-center font-display text-[clamp(1.9rem,3.2vw,2.85rem)] leading-[1.05] font-bold tracking-[-0.02em] text-ink"
        >
          Struktur Grup
        </h2>
        <p data-reveal="" className="mx-auto mt-4.5 mb-0 max-w-[56ch] text-center text-base leading-[1.7] text-ink-muted">
          DML duduk di sektor transportir. Lima sektor lain dijalankan perusahaan grup yang berbeda
          dan tidak dioperasikan DML.
        </p>

        <div className="mt-14 flex justify-center">
          <div
            data-node=""
            className="rounded-xl bg-accent px-10 py-5 text-center shadow-[0_22px_44px_-32px_rgb(15_27_46/0.7)]"
          >
            <p className="m-0 font-display text-lg font-bold text-on-accent">Sinar Alam Corporation</p>
            <p className="mt-1.75 mb-0 font-mono text-[11px] tracking-[0.16em] text-surface-3 uppercase">
              Perusahaan induk
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <span
            data-trunk=""
            aria-hidden="true"
            className="block h-11 w-px origin-top bg-surface-3 max-lg:hidden"
          />
        </div>

        {rows.map((row, rowIndex) => (
          <div key={`level-${rowIndex}`} className="relative pt-px">
            {/*
              Ujung tulang dihitung, tidak dipersentase: begitu grid punya gap,
              poros kolom tepi ada di (100% - 2*gap)/6 dari sisi, bukan di
              100%/6 — persentase meleset beberapa piksel dan garisnya berhenti
              di luar kartu.
            */}
            <span
              data-spine=""
              aria-hidden="true"
              className="absolute top-0 h-px origin-center bg-surface-3 max-lg:hidden"
              style={{
                left: `calc((100% - ${GAP_PX * 2}px) / 6)`,
                right: `calc((100% - ${GAP_PX * 2}px) / 6)`,
              }}
            />
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-7">
              {row.map((unit, unitIndex) => {
                const hasDml = unit.companies.includes(dmlLegalName);
                return (
                  <article
                    key={unit.sector}
                    data-reveal=""
                    data-reveal-group="chart"
                    className="flex flex-col items-center"
                  >
                    <span
                      data-drop=""
                      aria-hidden="true"
                      className="block h-8.5 w-px origin-top bg-surface-3 max-lg:hidden"
                    />
                    <div
                      onMouseEnter={hover(true)}
                      onMouseLeave={hover(false)}
                      className={`w-full overflow-hidden rounded-xl border transition-[border-color,box-shadow] duration-400 hover:border-accent hover:shadow-[0_22px_44px_-34px_rgb(24_49_99/0.6)] ${
                        hasDml ? "border-surface-3 bg-surface" : "border-accent-soft bg-surface-2"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-between gap-3 border-b px-5 py-3.75 ${
                          hasDml ? "border-surface-3" : "border-accent-soft"
                        }`}
                      >
                        <h3
                          className={`m-0 font-display text-[15px] font-bold ${
                            hasDml ? "text-accent" : "text-ink"
                          }`}
                        >
                          {unit.sector}
                        </h3>
                        <span
                          data-num=""
                          aria-hidden="true"
                          className={`font-mono text-[11px] tracking-[0.14em] ${
                            hasDml ? "text-line" : "text-line/70"
                          }`}
                        >
                          {String(rowIndex * ROW_SIZE + unitIndex + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <ul className="m-0 flex list-none flex-col gap-2.25 px-5 py-4.5">
                        {unit.companies.map((name) => {
                          const isDml = name === dmlLegalName;
                          return (
                            <li
                              key={name}
                              className={`flex items-start gap-2.25 text-[13px] leading-[1.5] ${
                                isDml ? "text-accent" : "text-ink-muted"
                              }`}
                            >
                              <span
                                aria-hidden="true"
                                className={`mt-1.5 block size-1.25 shrink-0 rounded-full ${
                                  isDml ? "bg-accent" : "bg-surface-3"
                                }`}
                              />
                              {name}
                              {isDml ? (
                                <span className="ml-0.5 shrink-0 self-center rounded-full bg-accent px-2.25 py-0.75 font-mono text-[9px] leading-tight tracking-[0.12em] whitespace-nowrap text-on-accent">
                                  DI SINI
                                </span>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>

            {rowIndex < rows.length - 1 ? (
              <div className="flex justify-center">
                <span
                  data-rail=""
                  aria-hidden="true"
                  className="block h-11 w-px origin-top bg-surface-3 max-lg:hidden"
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
