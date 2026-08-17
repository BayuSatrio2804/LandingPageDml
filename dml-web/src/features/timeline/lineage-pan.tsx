"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/motion/gsap";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";
import type { TimelineEntry } from "@/content/types";

export function LineagePan({ entries }: { entries: TimelineEntry[] }) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (reduced || !wrapper || !track) return;
    registerGsap();

    const ctx = gsap.context(() => {
      const distance = track.scrollWidth - wrapper.clientWidth;
      if (distance <= 0) return;

      gsap.to(track, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: `+=${distance}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, wrapperRef);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <div ref={wrapperRef} className="overflow-hidden">
      <div ref={trackRef} className={reduced ? "flex flex-wrap gap-6" : "flex gap-6"}>
        {entries.map((entry) => (
          <div key={entry.year} className="w-[min(80vw,420px)] shrink-0 rounded-card border border-surface-3 bg-surface-2 p-8">
            <p className="font-mono text-3xl text-accent">{entry.year}</p>
            <p className="mt-4 text-ink-muted">{entry.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
