"use client";

import Image from "next/image";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { MEDIA, avifSrc } from "@/lib/media/manifest";
import { MOTION } from "@/lib/motion/tokens";
import { useSectionMotion } from "@/lib/motion/use-section-motion";
import { BISNIS_PAGE_DEFAULTS, type BisnisPageData } from "./bisnis-defaults";

const BBM = MEDIA.bisnis.find((asset) => asset.id === "lini-bbm")!;
const RORO = MEDIA.bisnis.find((asset) => asset.id === "lini-roro")!;

/** Bagian yang tidak diedit admin: id, tautan, foto, urutan gambar. */
const PANEL_STATIC = [
  { id: "transportasi-bbm", href: "/bisnis/transportasi-bbm", asset: BBM, imageFirst: true },
  { id: "penumpang-roro", href: "/bisnis/penumpang-roro", asset: RORO, imageFirst: false },
] as const;

export function LiniUtamaRail({
  copy = BISNIS_PAGE_DEFAULTS.liniUtama,
}: {
  copy?: BisnisPageData["liniUtama"];
}) {
  const PANELS = PANEL_STATIC.map((base, i) => ({
    ...base,
    ...(copy.panels[i] ?? BISNIS_PAGE_DEFAULTS.liniUtama.panels[i]!),
  }));
  const root = useSectionMotion<HTMLElement>((scope) => {
    const q = gsap.utils.selector(scope);
    const rail = q("[data-pin-rail]")[0];
    const fill = q("[data-pin-fill]")[0];
    const num = q("[data-pin-num]")[0];
    const images = q("[data-pin-img]");
    if (!rail) return;

    /*
     * Sticky, BUKAN ScrollTrigger.pin. Pin menyuntik pin-spacer ke dalam
     * layout, dan setiap refreshScrollTriggers() — beranda memanggilnya saat
     * kanvas hero dan armada dipasang — menggeser seksi sesudah ini. Sticky
     * tidak mengubah tinggi dokumen sama sekali, jadi trigger seksi lain
     * tidak pernah memakai koordinat basi.
     */
    ScrollTrigger.create({
      trigger: scope,
      start: "top top",
      end: "bottom bottom",
      scrub: MOTION.scrub,
      onUpdate: (self) => {
        const p = self.progress;
        gsap.set(rail, { xPercent: -50 * p });
        if (fill) gsap.set(fill, { width: `${50 + 50 * p}%` });
        if (num) num.textContent = p > 0.5 ? "02" : "01";
        // Foto bergerak sedikit berlawanan arah: kedalaman tanpa memindahkan
        // teks yang sedang dibaca.
        images.forEach((img, i) =>
          gsap.set(img, { scale: 1.06 + p * 0.06, x: (i === 0 ? 1 : -1) * p * 24 }),
        );
      },
    });
  });

  return (
    <section
      ref={root}
      id="lini"
      data-index-section="lini"
      aria-labelledby="lini-title"
      className="relative h-[280vh] bg-hero-ground max-md:h-auto"
    >
      <h2 id="lini-title" className="sr-only">
        Lini utama
      </h2>

      <div className="sticky top-0 h-svh min-h-155 overflow-hidden max-md:static max-md:h-auto max-md:min-h-0">
        {/*
          max-md: rel jatuh jadi tumpukan vertikal. Panggung menyamping butuh
          tinggi viewport yang tidak dimiliki ponsel, dan memaksanya di sana
          menghasilkan teks 12px atau panel terpotong.
        */}
        <div
          data-pin-rail=""
          className="flex h-full w-[200%] max-md:w-full max-md:flex-col"
        >
          {PANELS.map((panel, index) => (
            <article
              key={panel.id}
              className="relative grid h-full w-1/2 shrink-0 grid-cols-2 max-md:w-full max-md:grid-cols-1"
            >
              <div
                className={`relative overflow-hidden max-md:aspect-4/3 ${panel.imageFirst ? "" : "order-last max-md:order-first"}`}
              >
                <Image
                  data-pin-img=""
                  src={avifSrc(panel.asset, 1080)}
                  alt={panel.asset.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <div
                  aria-hidden="true"
                  className={`absolute inset-0 ${panel.imageFirst ? "bg-linear-100" : "bg-linear-260"} from-hero-ground/28 via-hero-ground/5 to-hero-ground/95`}
                />
              </div>

              <div className="flex flex-col justify-center gap-5.5 p-[clamp(2rem,4vw,4.5rem)]">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="h-0.5 w-6.5 bg-accent-lift" />
                  <span className="font-mono text-[11px] tracking-[0.2em] text-on-accent uppercase">
                    {panel.num} · Dijalankan sendiri
                  </span>
                </div>

                <h3 className="m-0 font-display text-[clamp(1.9rem,3.4vw,3.25rem)] leading-[1.02] font-bold tracking-[-0.02em] text-on-accent text-pretty">
                  {panel.title}
                </h3>

                <p className="m-0 max-w-[44ch] text-[17px] leading-relaxed text-on-accent/80">
                  {panel.summary}
                </p>

                <div className="flex items-baseline gap-3">
                  <span className="font-display text-[clamp(2.5rem,4.4vw,3.75rem)] leading-none font-bold text-on-accent">
                    {panel.metric}
                  </span>
                  <span className="max-w-[14ch] font-mono text-[11px] tracking-[0.16em] text-on-accent/60 uppercase">
                    {panel.metricLabel}
                  </span>
                </div>

                <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                  {panel.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="rounded-full border border-on-accent/26 px-3.5 py-1.5 font-mono text-[11px] text-on-accent"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>

                <div>
                  <Link
                    href={panel.href}
                    className={
                      index === 0
                        ? "inline-flex items-center gap-2.5 rounded-full bg-surface-2 px-6.5 py-3.5 text-sm font-medium text-accent transition-all hover:gap-4 hover:bg-on-accent hover:text-accent-hover"
                        : "inline-flex items-center gap-2.5 rounded-full border border-on-accent/50 px-6.5 py-3.5 text-sm font-medium text-on-accent transition-all hover:gap-4 hover:border-on-accent hover:bg-on-accent/12"
                    }
                  >
                    {panel.cta} <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-center gap-5 px-[clamp(1.5rem,4vw,4rem)] pb-7 max-md:hidden">
          <span data-pin-num="" className="font-mono text-[11px] tracking-[0.18em] text-on-accent">
            01
          </span>
          <span aria-hidden="true" className="relative h-px flex-1 bg-on-accent/22">
            <span data-pin-fill="" className="absolute top-0 left-0 h-px w-1/2 bg-accent-lift" />
          </span>
          <span className="font-mono text-[11px] tracking-[0.18em] text-on-accent/50">02</span>
        </div>
      </div>
    </section>
  );
}
