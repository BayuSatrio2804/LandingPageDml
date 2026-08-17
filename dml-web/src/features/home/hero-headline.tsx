"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, SplitText } from "@/lib/motion/gsap";
import { MOTION } from "@/lib/motion/tokens";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";

/**
 * Mask-reveal per baris. Reduced motion tidak sekadar mempercepat animasi:
 * SplitText memecah DOM heading jadi banyak div, jadi jalur reduced motion
 * mengembalikan heading utuh tanpa pernah memecahnya sama sekali.
 */
export function HeroHeadline({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (reduced || !node) return;
    registerGsap();

    const ctx = gsap.context(() => {
      const split = new SplitText(node, { type: "lines", linesClass: "overflow-hidden" });
      gsap.from(split.lines, {
        yPercent: 110,
        duration: MOTION.slow,
        ease: MOTION.ease,
        stagger: 0.12,
      });
      return () => split.revert();
    }, ref);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <h1
      ref={ref}
      className="max-w-[22ch] font-display text-4xl font-bold tracking-tight text-ink md:text-6xl"
    >
      {children}
    </h1>
  );
}
