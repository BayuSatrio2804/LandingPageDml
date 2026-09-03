"use client";

import { useEffect, useRef, type RefObject } from "react";
import { gsap, registerGsap } from "@/lib/motion/gsap";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";

/**
 * Membungkus pola yang dipakai seluruh seksi /bisnis: registrasi GSAP sekali,
 * satu gsap.context yang ter-scope ke ref, dan revert di cleanup.
 *
 * Cleanup-nya bukan formalitas. Tanpa ctx.revert(), ScrollTrigger yang dibuat
 * di sini tetap hidup setelah navigasi App Router, dan nilai inline hasil
 * tween menempel di elemen yang sudah tidak dirender.
 *
 * Ketika pengguna meminta gerak dikurangi, `build` tidak dipanggil sama
 * sekali dan komponen tetap menampilkan keadaan akhirnya dari markup. Itu
 * sebabnya setiap komponen di folder ini menulis keadaan TERBACA sebagai
 * default, lalu GSAP yang menyembunyikannya — bukan sebaliknya.
 */
export function useSectionMotion<T extends HTMLElement>(
  build: (scope: T) => void,
): RefObject<T | null> {
  const root = useRef<T>(null);
  const reduced = usePrefersReducedMotion();
  const buildRef = useRef(build);

  // Menyimpan closure terbaru lewat efek yang jalan tiap render (tanpa
  // dependency array), bukan menulis ref.current langsung saat render —
  // react-hooks/refs melarang penulisan ref selama render.
  useEffect(() => {
    buildRef.current = build;
  });

  useEffect(() => {
    const scope = root.current;
    if (reduced || !scope) return;
    registerGsap();
    const ctx = gsap.context(() => buildRef.current(scope), root);
    return () => ctx.revert();
  }, [reduced]);

  return root;
}
