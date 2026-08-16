"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";
import { registerGsap, ScrollTrigger, gsap } from "@/lib/motion/gsap";

/**
 * Tidak merender elemen apa pun. Membungkus aplikasi tanpa mengubah DOM,
 * sehingga seluruh konten tetap berada di Server Component.
 *
 * Provider ini TIDAK BOLEH memanggil ScrollTrigger.getAll().kill(). Dia tidak
 * membuat satu pun ScrollTrigger, jadi dia tidak berhak membunuh milik siapa
 * pun. Trigger yang tidak ikut bergantung pada reduced, misalnya yang tugasnya
 * cuma onEnter untuk memuat kanvas 3D, tidak akan pernah dibuat ulang kalau
 * dibunuh dari sini. Pembersihan trigger adalah tanggung jawab masing masing
 * komponen lewat ctx.revert(), sesuai Global Constraints.
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    registerGsap();
    if (reduced) return;

    const lenis = new Lenis({ autoRaf: false });

    // Satu ticker untuk Lenis dan GSAP. Dua RAF loop terpisah akan
    // saling mendahului dan membuat ScrollTrigger salah menghitung posisi.
    const onTick = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(onTick);

    // lagSmoothing global. Dimatikan supaya Lenis yang memegang kendali waktu,
    // lalu WAJIB dikembalikan ke default di cleanup. Nilai 500 dan 33 itu
    // default GSAP yang sebenarnya, terbaca di gsap-core.js.
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, [reduced]);

  return <>{children}</>;
}
