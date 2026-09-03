"use client";

import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { MOTION } from "@/lib/motion/tokens";

/**
 * Reveal untuk elemen bertanda `data-reveal` di dalam satu scope.
 *
 * Elemen dengan `data-reveal="clip"` tersingkap lewat clip-path (dipakai untuk
 * judul, resep yang sama dengan headline hero); sisanya naik dan memudar masuk.
 * Anggota `data-reveal-group` yang sama masuk berurutan.
 *
 * Jeda per anggota dibatasi lima langkah dengan sengaja: sembilan baris dokumen
 * legal dengan jeda murni membuat baris terakhir menunggu hampir sedetik, dan
 * itu terbaca sebagai lag, bukan irama.
 */
export function revealBatch(scope: HTMLElement) {
  const q = gsap.utils.selector(scope);

  q("[data-reveal]").forEach((el) => {
    const clip = el.getAttribute("data-reveal") === "clip";
    const group = el.getAttribute("data-reveal-group");
    const index = group
      ? Array.from(scope.querySelectorAll(`[data-reveal-group="${group}"]`)).indexOf(el)
      : 0;

    gsap.fromTo(
      el,
      clip ? { clipPath: "inset(0% 0% 100% 0%)", y: 24 } : { y: 20, autoAlpha: 0 },
      {
        ...(clip
          ? { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: MOTION.slow, ease: "expo.out" }
          : { y: 0, autoAlpha: 1, duration: MOTION.base, ease: MOTION.ease }),
        delay: Math.min(Math.max(0, index), 5) * 0.07,
        clearProps: "clipPath,transform,opacity,visibility",
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
      },
    );
  });
}

/**
 * Angka berhitung sekali saat masuk layar.
 *
 * Nilai akhirnya sudah tercetak di markup, jadi ini murni penghias: kalau JS
 * gagal, angkanya tetap benar. Tahun dihitung dari basis dekade, bukan 40%
 * seperti angka jumlah — 1988 yang mulai dari 795 terbaca sebagai data rusak.
 */
export function countUpBatch(scope: HTMLElement) {
  gsap.utils.selector(scope)("[data-count]").forEach((el) => {
    const target = Number(el.getAttribute("data-count"));
    if (!target) return;
    const from = target > 1000 ? target - 24 : Math.round(target * 0.4);
    const proxy = { v: from };
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
}
