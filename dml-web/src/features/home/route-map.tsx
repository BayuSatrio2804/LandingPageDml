"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap } from "@/lib/motion/gsap";
import { MOTION } from "@/lib/motion/tokens";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";
import { PORTS, ROUTE_LEGS } from "@/features/route-map/ports";
import { VIEWBOX, project } from "@/features/route-map/projection";
import { SectionHeader } from "@/components/ui/section-header";
import { OverlayPanel } from "@/components/ui/overlay-panel";
import coastline from "@/features/route-map/coastline.json";

const PORT_BY_ID = new Map(PORTS.map((port) => [port.id, port]));

function coastlinePath(ring: number[][]): string {
  return (
    ring
      .map((coord, index) => {
        const { x, y } = project({ lon: coord[0] ?? 0, lat: coord[1] ?? 0 });
        return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ") + " Z"
  );
}

function legPath(fromId: string, toId: string): string {
  const from = PORT_BY_ID.get(fromId);
  const to = PORT_BY_ID.get(toId);
  if (!from || !to) return "";
  const a = project(from);
  const b = project(to);
  // Busur, bukan garis lurus. Tiga leg yang berbagi Lembar dan Surabaya akan
  // saling menimpa kalau semuanya lurus; lengkungan kecil memisahkannya tanpa
  // memalsukan jaraknya.
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2 - Math.hypot(b.x - a.x, b.y - a.y) * 0.12;
  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

export function RouteMap() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const mapRef = useRef<SVGSVGElement | null>(null);
  const legRefs = useRef<(SVGPathElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    const map = mapRef.current;
    if (reduced || !section || !map) return;
    registerGsap();

    const ctx = gsap.context(() => {
      const legs = legRefs.current.filter((el): el is SVGPathElement => el !== null);
      for (const leg of legs) {
        const length = leg.getTotalLength();
        gsap.set(leg, { strokeDasharray: length, strokeDashoffset: length });
      }

      // Satu timeline men-scrub tiga hal sekaligus: zoom peta dari seluruh
      // bbox ke koridor rute, dan tiap leg menggambar dirinya berurutan.
      // Alasannya satu kalimat: urutan gambar menjelaskan jaringan lebih cepat
      // daripada tiga garis yang muncul bersamaan.
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=200%",
          pin: true,
          scrub: MOTION.scrub,
          invalidateOnRefresh: true,
        },
      });

      timeline.fromTo(map, { scale: 1, transformOrigin: "50% 50%" }, { scale: 1.25, ease: "none" }, 0);
      legs.forEach((leg, index) => {
        timeline.to(leg, { strokeDashoffset: 0, ease: "none" }, index * 0.8);
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={sectionRef} className="relative flex min-h-[100dvh] items-center overflow-hidden bg-surface-2">
      <svg
        ref={mapRef}
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Peta jaringan penyeberangan ro-ro antara Jawa Timur, Lombok, dan Kalimantan Tengah"
      >
        {coastline.polygons.map((ring, index) => (
          <path
            key={index}
            data-testid="garis-pantai"
            d={coastlinePath(ring)}
            fill="#18292F"
            stroke="#111E24"
            strokeWidth={1}
          />
        ))}

        {ROUTE_LEGS.map((leg, index) => (
          <path
            key={leg.id}
            data-testid="leg-rute"
            ref={(el) => {
              legRefs.current[index] = el;
            }}
            d={legPath(leg.fromId, leg.toId)}
            fill="none"
            stroke="#FF5A1F"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        ))}

        {PORTS.map((port) => {
          const { x, y } = project(port);
          return (
            <g key={port.id}>
              <circle cx={x} cy={y} r={port.kind === "kantor" ? 4 : 6} fill={port.kind === "kantor" ? "#8FA1A8" : "#FF5A1F"} />
              <text x={x + 12} y={y + 4} fontSize={14} fill="#F2EFE9" fontFamily="var(--font-mono)">
                {port.name}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] grid-cols-12 px-4 md:px-8">
        <OverlayPanel className="col-span-12 md:col-span-5">
          <SectionHeader
            title="Rute Penyeberangan Ro-Ro"
            description="Tiga leg penyeberangan yang menghubungkan Jawa Timur, Lombok, dan Kalimantan Tengah."
          />
          <ul className="mt-8 space-y-3 font-mono text-sm text-ink">
            {ROUTE_LEGS.map((leg) => (
              <li key={leg.id}>{leg.label}</li>
            ))}
          </ul>
        </OverlayPanel>
      </div>
    </section>
  );
}
