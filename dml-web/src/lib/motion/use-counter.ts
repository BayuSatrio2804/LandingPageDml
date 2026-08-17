"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

export function useCounter(
  target: number,
  options?: { duration?: number },
): { ref: React.RefObject<HTMLElement | null>; value: number } {
  const ref = useRef<HTMLElement | null>(null);
  const [value, setValue] = useState(0);
  const reduced = usePrefersReducedMotion();
  const duration = options?.duration ?? 1200;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    /**
     * Untuk reduced motion, nilai akhir dihitung langsung saat render (lihat
     * `return` di bawah), bukan lewat setState sinkron di sini. Memanggil
     * setValue langsung di body efek memicu render bertingkat dan ditolak
     * react-hooks/set-state-in-effect, seperti pola useIsDesktop di
     * fleet-comparator.tsx. Efek ini cukup berhenti tanpa memasang observer.
     */
    if (reduced) return;

    let frame: number | null = null;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.disconnect();
          const start = performance.now();

          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            setValue(Math.round(target * progress));
            if (progress < 1) {
              frame = requestAnimationFrame(tick);
            }
          };
          frame = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [target, duration, reduced]);

  return { ref, value: reduced ? target : value };
}
