"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap } from "@/lib/motion/gsap";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";
import { PORTS } from "@/features/route-map/ports";
import { VIEWBOX, project } from "@/features/route-map/projection";

// Jembatan sementara: Task 5 mengganti Port.x/y jadi lat/lon geografis, dan
// seksi ini baru ditulis ulang penuh di Task 7. project() di sini cuma
// menjaga typecheck hijau di antara dua task, bukan implementasi akhir.
function routePath(): string {
  return PORTS.map((port, index) => {
    const { x, y } = project(port);
    return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
}

export function RouteMap() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    const path = pathRef.current;
    if (reduced || !section || !path) return;
    registerGsap();

    const ctx = gsap.context(() => {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

      gsap.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          end: "bottom 70%",
          scrub: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={sectionRef} className="bg-surface-2 py-24">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <h2 className="font-display text-3xl font-bold text-ink md:text-5xl">Rute Penyeberangan Ro-Ro</h2>
        <p className="mt-4 max-w-[55ch] text-ink-muted">
          Empat pelabuhan, satu jaringan penyeberangan yang menghubungkan Kalimantan dan Jawa.
        </p>
        <svg viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`} className="mt-12 h-auto w-full max-w-2xl" role="img" aria-label="Peta rute penyeberangan Ketapang, Lembar, Tanjung Perak Surabaya, dan Kumai">
          <path ref={pathRef} d={routePath()} fill="none" stroke="#FF5A1F" strokeWidth={2} />
          {PORTS.map((port) => {
            const { x, y } = project(port);
            return (
              <g key={port.name}>
                <circle cx={x} cy={y} r={4} fill="#FF5A1F" />
                <text x={x + 8} y={y + 4} fontSize={11} fill="#F2EFE9" fontFamily="var(--font-mono)">
                  {port.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
