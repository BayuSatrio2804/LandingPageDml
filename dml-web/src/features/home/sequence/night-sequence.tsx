"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/motion/gsap";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";
import { type MediaAsset, avifSrc } from "@/lib/media/manifest";

/**
 * Layer poster (di Hero, Server Component) tetap jadi LCP. Komponen ini
 * menambah sembilan frame sisanya sebagai layer <img> bertumpuk yang
 * di-crossfade lewat opacity mengikuti progress scroll. Tidak ada WebGL,
 * tidak ada elemen di atas fold selain poster yang sudah ada.
 */
export function NightSequence({ frames }: { frames: MediaAsset[] }) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const layerRefs = useRef<(HTMLImageElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const section = sectionRef.current?.closest("section");
    if (reduced || !section) return;
    registerGsap();

    const ctx = gsap.context(() => {
      const layers = layerRefs.current.filter((el): el is HTMLImageElement => el !== null);
      gsap.set(layers, { opacity: 0 });

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=120%",
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          const position = self.progress * (layers.length - 1);
          const index = Math.floor(position);
          const localProgress = position - index;
          const current = layers[index];
          const next = layers[index + 1];
          layers.forEach((layer) => gsap.set(layer, { opacity: 0 }));
          if (current) gsap.set(current, { opacity: 1 - localProgress });
          if (next) gsap.set(next, { opacity: localProgress });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reduced]);

  if (reduced) return null;

  return (
    <div ref={sectionRef} className="absolute inset-0" aria-hidden>
      {frames.map((frame, index) => (
        <img
          key={frame.id}
          ref={(el) => {
            layerRefs.current[index] = el;
          }}
          src={avifSrc(frame, 1600)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading={index === 0 ? "eager" : "lazy"}
        />
      ))}
    </div>
  );
}
