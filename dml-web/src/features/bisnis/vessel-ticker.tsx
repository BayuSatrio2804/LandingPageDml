"use client";

import { gsap } from "@/lib/motion/gsap";
import type { Vessel } from "@/content/types";
import { useSectionMotion } from "@/lib/motion/use-section-motion";

const PX_PER_SECOND = 46;

/**
 * Bilah nama kapal antar seksi. Isinya 66 nama dari company profile hal. 04,
 * jadi ini konten nyata yang dipakai sebagai tekstur, bukan dekorasi karangan.
 */
export function VesselTicker({ vessels }: { vessels: Vessel[] }) {
  const root = useSectionMotion<HTMLElement>((scope) => {
    const rail = scope.querySelector<HTMLElement>("[data-vessel-rail]");
    if (!rail) return;
    requestAnimationFrame(() => {
      const half = rail.scrollWidth / 2;
      if (!half) return;
      gsap.to(rail, { x: -half, duration: half / PX_PER_SECOND, ease: "none", repeat: -1 });
    });
  });

  const names = vessels.map((vessel) => vessel.name);

  return (
    <section
      ref={root}
      aria-label="Nama kapal armada"
      className="overflow-hidden bg-accent py-6.5"
    >
      <ul data-vessel-rail="" className="m-0 flex w-max list-none p-0">
        {[...names, ...names].map((name, index) => (
          <li
            key={`${name}-${index}`}
            aria-hidden={index >= names.length}
            className="flex shrink-0 items-center gap-5 pr-5 font-mono text-[13px] whitespace-nowrap text-on-accent/82"
          >
            {name}
            <span aria-hidden="true" className="block size-0.75 rounded-full bg-accent-lift" />
          </li>
        ))}
      </ul>
    </section>
  );
}
