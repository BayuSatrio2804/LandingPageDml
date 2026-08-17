"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, registerGsap } from "@/lib/motion/gsap";
import { MOTION } from "@/lib/motion/tokens";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";
import { type MediaAsset, avifSrc } from "@/lib/media/manifest";

/**
 * Zoom keluar plus drift vertikal yang lebih lambat dari halaman. Alasannya
 * satu kalimat: potongan malam ke siang adalah potongan film, dan kamera yang
 * menjauh memberi jeda sebelum halaman berpindah dari suasana ke informasi.
 */
export function DayCutMedia({ frame }: { frame: MediaAsset }) {
  const layerRef = useRef<HTMLImageElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const layer = layerRef.current;
    const section = layer?.closest("section");
    if (reduced || !layer || !section) return;
    registerGsap();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        layer,
        { scale: 1.12, yPercent: -4 },
        {
          scale: 1,
          yPercent: 4,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: MOTION.scrub,
          },
        },
      );
    });

    return () => ctx.revert();
  }, [reduced]);

  return (
    <Image
      ref={layerRef}
      src={avifSrc(frame, 2400)}
      alt={frame.alt}
      fill
      sizes="100vw"
      className="absolute inset-0 object-cover"
    />
  );
}
