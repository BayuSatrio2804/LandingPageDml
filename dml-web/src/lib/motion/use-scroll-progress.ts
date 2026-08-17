"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, ScrollTrigger } from "./gsap";
import { MOTION } from "./tokens";

export type ScrollProgressOptions = {
  end: string;
  pin?: boolean;
  scrub?: number | boolean;
  disabled?: boolean;
};

export function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/**
 * Satu-satunya jembatan dari ScrollTrigger ke dalam boundary R3F. Nilai
 * ditulis ke ref, bukan ke state: progress berubah tiap frame scroll, dan
 * setState di sana akan me-render ulang seluruh pohon React 60 kali sedetik.
 * Konsumen membacanya di dalam useFrame.
 */
export function useScrollProgress(
  targetRef: React.RefObject<HTMLElement | null>,
  { end, pin = false, scrub = MOTION.scrub, disabled = false }: ScrollProgressOptions,
): React.RefObject<number> {
  const progressRef = useRef(0);

  useEffect(() => {
    const target = targetRef.current;
    if (disabled || !target) return;
    registerGsap();

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: target,
        start: "top top",
        end,
        pin,
        scrub,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progressRef.current = clampProgress(self.progress);
        },
      });
    }, targetRef);

    return () => ctx.revert();
  }, [targetRef, end, pin, scrub, disabled]);

  return progressRef;
}
