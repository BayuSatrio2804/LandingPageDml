"use client";

import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { useSectionMotion } from "@/lib/motion/use-section-motion";

const SECTIONS = [
  { id: "lini", label: "01 Lini utama" },
  { id: "sts", label: "02 Ship-to-ship" },
  { id: "afiliasi", label: "03 Afiliasi" },
  { id: "klien", label: "04 Klien" },
  { id: "kontak", label: "05 Kontak" },
];

/**
 * Indeks seksi mengambang plus garis progres gulir.
 *
 * Dipasang sebagai komponen sendiri, bukan di dalam tiap seksi, karena
 * triggernya menunjuk elemen SEKSI (`[data-index-section]`) yang dirender
 * komponen lain. Itu berarti ia harus dimount setelah seksi-seksi itu ada di
 * DOM — di page.tsx ia diletakkan paling bawah.
 */
export function SectionIndexRail() {
  const root = useSectionMotion<HTMLDivElement>((scope) => {
    const bar = scope.querySelector<HTMLElement>("[data-scroll-bar]");
    if (bar) {
      ScrollTrigger.create({
        start: 0,
        end: () => document.documentElement.scrollHeight - window.innerHeight,
        scrub: true,
        onUpdate: (self) => gsap.set(bar, { width: `${self.progress * 100}%` }),
      });
    }

    SECTIONS.forEach((section) => {
      const target = document.querySelector(`[data-index-section="${section.id}"]`);
      const dot = scope.querySelector<HTMLElement>(`[data-index-dot="${section.id}"]`);
      if (!target || !dot) return;
      const mark = dot.querySelector<HTMLElement>("[data-index-mark]");
      const label = dot.querySelector<HTMLElement>("[data-index-label]");

      ScrollTrigger.create({
        trigger: target,
        start: "top 55%",
        end: "bottom 45%",
        onToggle: (self) => {
          if (mark) {
            gsap.to(mark, {
              width: self.isActive ? 30 : 14,
              backgroundColor: self.isActive ? "var(--color-accent)" : "var(--color-surface-3)",
              duration: 0.4,
              ease: "power2.out",
            });
          }
          if (label) gsap.to(label, { opacity: self.isActive ? 1 : 0.55, duration: 0.4 });
          gsap.to(dot, {
            color: self.isActive ? "var(--color-accent)" : "var(--color-line)",
            duration: 0.4,
          });
        },
      });
    });
  });

  return (
    <div ref={root}>
      <div
        data-scroll-bar=""
        aria-hidden="true"
        className="fixed top-0 left-0 z-70 h-0.5 w-0 bg-accent"
      />
      <nav
        aria-label="Indeks seksi"
        className="fixed top-1/2 right-6.5 z-45 flex -translate-y-1/2 flex-col gap-3.5 max-xl:hidden"
      >
        {SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            data-index-dot={section.id}
            className="flex items-center justify-end gap-2.5 font-mono text-[10px] tracking-[0.16em] text-line uppercase hover:text-accent"
          >
            <span data-index-label="" className="opacity-55">
              {section.label}
            </span>
            <span data-index-mark="" aria-hidden="true" className="block h-px w-3.5 bg-surface-3" />
          </a>
        ))}
      </nav>
    </div>
  );
}
