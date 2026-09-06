"use client";

import { gsap } from "@/lib/motion/gsap";
import type { BusinessLine } from "@/content/types";
import { MOTION } from "@/lib/motion/tokens";
import { useSectionMotion } from "@/lib/motion/use-section-motion";
import { BISNIS_PAGE_DEFAULTS, type BisnisPageData } from "@/features/bisnis/bisnis-defaults";

/**
 * Kartu afiliasi untuk halaman Tentang Kami — pengganti AfiliasiRows (daftar
 * baris) yang dulu hidup di /bisnis.
 *
 * TANPA FOTO dengan sengaja. Tiga perusahaan ini bukan DML, dan aset foto yang
 * ada di repo semuanya armada DML sendiri; memasang foto kapal DML di kartu
 * PT Duta Wisata Bahari berarti memberi label yang salah di halaman
 * klien-facing. Kalau klien mengirim foto masing-masing afiliasi, ganti blok
 * header berwarna dengan <Image fill> + overlay gradient dan buang HEADER_TONE.
 */
const HEADER_TONE = [
  "bg-dark-field",
  "bg-accent",
  "bg-line",
] as const;

/** Label kategori di kaki kartu, dipetakan dari id business-line. */
const CATEGORY: Record<string, string> = {
  "tri-sumaja-lines": "Kapal penumpang",
  "duta-wisata-bahari": "Wisata bahari",
  "dutabahari-teknik": "Galangan & perawatan",
};

export function AfiliasiCards({
  affiliates,
  copy = BISNIS_PAGE_DEFAULTS.afiliasi,
}: {
  affiliates: BusinessLine[];
  copy?: BisnisPageData["afiliasi"];
}) {
  const root = useSectionMotion<HTMLElement>((scope) => {
    const q = gsap.utils.selector(scope);

    q("[data-affiliate-card]").forEach((card, index) => {
      gsap.fromTo(
        card,
        { y: 22, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: MOTION.base,
          ease: MOTION.ease,
          delay: index * 0.09,
          clearProps: "transform,opacity,visibility",
          scrollTrigger: { trigger: card, start: "top 92%", once: true },
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
   * Empat hal bergerak bersamaan dengan easing berbeda: kartu terangkat,
   * sapuan cahaya melintas header (fromTo, karena harus mulai dari kiri tiap
   * kali), nomor menyala, dan panah masuk. Ditulis di GSAP, bukan hover:
   * variant, supaya keempatnya tidak perlu dijaga sinkron lewat empat
   * transition CSS.
   */
  const setHover = (on: boolean) => (event: React.MouseEvent<HTMLElement>) => {
    const card = event.currentTarget;
    const sheen = card.querySelector<HTMLElement>("[data-card-sheen]");
    const num = card.querySelector<HTMLElement>("[data-card-num]");
    const arrow = card.querySelector<HTMLElement>("[data-card-arrow]");

    gsap.to(card, {
      y: on ? -8 : 0,
      boxShadow: on
        ? "0 34px 66px -38px rgb(15 27 46 / 0.62)"
        : "0 24px 54px -44px rgb(15 27 46 / 0.5)",
      duration: 0.5,
      ease: MOTION.ease,
    });
    if (sheen) {
      if (on) gsap.fromTo(sheen, { opacity: 0, x: 0 }, { opacity: 1, x: 420, duration: 1, ease: "power2.out" });
      else gsap.to(sheen, { opacity: 0, duration: 0.4 });
    }
    if (num) gsap.to(num, { opacity: on ? 1 : 0.72, x: on ? 6 : 0, duration: 0.4 });
    if (arrow) gsap.to(arrow, { opacity: on ? 1 : 0.28, x: on ? 0 : -8, duration: 0.4 });
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
              {copy.kicker}
            </p>
            <h2
              id="afiliasi-title"
              data-reveal-clip=""
              className="mt-3.5 mb-0 font-display text-[clamp(2rem,3.6vw,3.25rem)] leading-[1.03] font-bold tracking-[-0.02em] text-ink text-pretty"
            >
              {copy.heading}
            </h2>
          </div>
          <p className="m-0 max-w-[40ch] text-[15px] leading-relaxed text-ink-muted">
            {copy.subtext}
          </p>
        </div>

        {/*
          Floor track 15.5rem (bukan 18rem): di lebar container ~840px tiga
          track 18rem tidak muat, dan kartu ketiga jatuh sendirian ke baris
          kedua dengan satu sel kosong di sebelahnya.
        */}
        <div className="mt-14 grid grid-cols-[repeat(auto-fit,minmax(min(100%,15.5rem),1fr))] items-stretch gap-5">
          {affiliates.map((affiliate, index) => (
            <article
              key={affiliate.id}
              data-affiliate-card=""
              onMouseEnter={setHover(true)}
              onMouseLeave={setHover(false)}
              className="relative flex flex-col overflow-hidden rounded-[14px] bg-surface-2 shadow-[0_24px_54px_-44px_rgb(15_27_46/0.5)]"
            >
              <div
                className={`relative overflow-hidden px-5.5 pt-6.5 pb-6 ${HEADER_TONE[index % HEADER_TONE.length]}`}
              >
                <span
                  data-card-sheen=""
                  aria-hidden="true"
                  className="absolute -top-3/5 -left-3/10 h-[220%] w-[55%] bg-linear-100 from-transparent via-on-accent/40 to-transparent opacity-0"
                />
                <span
                  data-card-num=""
                  aria-hidden="true"
                  className="relative block font-display text-[2rem] leading-[0.9] font-bold text-on-accent/72"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                {/*
                  min-h dua baris: satu nama yang wrap (PT Duta Wisata Bahari)
                  membuat band-nya 21px lebih tinggi dari tetangganya, dan
                  seluruh isi kartu ikut bergeser sebaris.
                */}
                <p className="relative mt-8.5 mb-0 min-h-[2.4em] font-display text-[clamp(1.1rem,1.5vw,1.4rem)] leading-[1.2] font-bold text-on-accent text-pretty">
                  {affiliate.title}
                </p>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <p className="m-0 min-h-[4.95em] leading-relaxed text-ink-muted">
                  {affiliate.summary}
                </p>
                <ul className="mt-4.5 flex list-none flex-wrap gap-2.5 p-0">
                  {affiliate.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="rounded-full border border-surface-3 px-3.5 py-1.5 font-mono text-xs text-ink"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex items-center justify-between gap-4 border-t border-accent-soft pt-6">
                  <p className="m-0 font-mono text-[11px] tracking-[0.14em] text-line uppercase">
                    {CATEGORY[affiliate.id] ?? "Afiliasi"}
                  </p>
                  <span
                    data-card-arrow=""
                    aria-hidden="true"
                    className="-translate-x-2 text-xl text-accent opacity-28"
                  >
                    →
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
