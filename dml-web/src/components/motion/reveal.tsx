"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap } from "@/lib/motion/gsap";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";

export function Reveal({
  children,
  stagger = 0.06,
  className,
}: {
  children: React.ReactNode;
  stagger?: number;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    // Ditangkap ke const, bukan root.current! di dalam closure. Guard di
    // baris berikutnya menyempitkan tipenya sekali di sini, dan penyempitan
    // itu bertahan lewat closure karena container tidak pernah berubah.
    const container = root.current;
    if (reduced || !container) return;
    registerGsap();

    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray<HTMLElement>(container.children);
      gsap.fromTo(
        targets,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger,
          // Melepas gaya inline setelah selesai. Tanpa ini, opacity dan
          // transform hasil tween tetap menempel sebagai style inline dan
          // menang atas CSS mana pun yang mengubah keduanya belakangan.
          clearProps: "opacity,transform",
          scrollTrigger: {
            trigger: container,
            start: "top 82%",
            once: true,
          },
        },
      );
    }, root);

    return () => ctx.revert();
  }, [reduced, stagger]);

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
