"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap, registerGsap } from "@/lib/motion/gsap";
import { MOTION } from "@/lib/motion/tokens";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";
import { useIsDesktop } from "@/lib/motion/use-is-desktop";
import { PORTS, ROUTE_LEGS, type RouteLeg } from "@/features/route-map/ports";
import { VIEWBOX, project } from "@/features/route-map/projection";
import { SectionHeader } from "@/components/ui/section-header";
import coastline from "@/features/route-map/coastline.json";

const PORT_BY_ID = new Map(PORTS.map((port) => [port.id, port]));

/**
 * Waktu timeline dalam satuan sembarang; ScrollTrigger yang memetakannya ke
 * panjang scroll. Ditulis eksplisit supaya jeda akhir bisa dilihat sebagai
 * angka, bukan sebagai efek samping dari durasi default GSAP.
 *
 * Versi Plan 4 menaruh tiga leg di posisi 0, 0,8, dan 1,6 dengan durasi
 * default 0,5, jadi leg terakhir selesai persis di frame terakhir pin: rute
 * Kumai-Surabaya "cepat selesai" lalu pin langsung dilepas tanpa satu pun
 * frame tenang. HOLD di bawah yang memperbaiki itu.
 */
const INTRO = 0.6;
const LEG_DURATION = 1.2;
const LEG_GAP = 1.4;
const HOLD = 2.6;
const TOTAL = INTRO + LEG_GAP * (ROUTE_LEGS.length - 1) + LEG_DURATION + HOLD;
const PIN_LENGTH = "+=260%";

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
  // Busur, bukan garis lurus. Leg yang berbagi Lembar dan Surabaya akan saling
  // menimpa kalau semuanya lurus; lengkungan kecil memisahkannya tanpa
  // memalsukan jaraknya.
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2 - Math.hypot(b.x - a.x, b.y - a.y) * 0.12;
  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

/** Leg mana yang sedang digambar pada progress tertentu. */
export function activeLegIndex(progress: number, count: number, total = TOTAL): number {
  if (count <= 0) return 0;
  const time = Math.min(1, Math.max(0, progress)) * total;
  const raw = Math.floor((time - INTRO) / LEG_GAP);
  return Math.min(count - 1, Math.max(0, raw));
}

function RouteSvg({
  mapRef,
  legRefs,
  activeIndex,
  drawn,
  /**
   * Pengali ukuran penanda dan label, relatif ke ruang viewBox.
   *
   * Peta yang sama dipakai di dua lebar yang sangat berbeda: panggung dipaku
   * selebar viewport di desktop, dan kotak aspect-3/2 selebar kolom di mobile.
   * Karena viewBox-nya 1000 unit, teks berukuran 13 unit mengecil jadi sekitar
   * 5 piksel di layar 375 px, yang tidak terbaca oleh siapa pun. Pengali ini
   * yang membuat versi mobil punya label sebesar sekitar 11 piksel.
   */
  markerScale = 1,
}: {
  mapRef?: React.RefObject<SVGSVGElement | null>;
  legRefs?: React.RefObject<(SVGPathElement | null)[]>;
  activeIndex: number;
  drawn: boolean;
  markerScale?: number;
}) {
  const activeLeg = ROUTE_LEGS[activeIndex];
  const litPorts = useMemo(
    () => new Set(activeLeg ? [activeLeg.fromId, activeLeg.toId] : []),
    [activeLeg],
  );

  return (
    <svg
      ref={mapRef}
      viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      role="img"
      aria-label="Peta jaringan penyeberangan ro-ro antara Sumatera, Jawa, Bali, Lombok, dan Kalimantan"
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
            if (legRefs) legRefs.current[index] = el;
          }}
          d={legPath(leg.fromId, leg.toId)}
          fill="none"
          stroke={leg.operator === "dml" ? "#FF5A1F" : "#8FA1A8"}
          strokeWidth={(index === activeIndex ? 3.5 : 2.5) * markerScale}
          strokeLinecap="round"
          strokeDasharray={drawn ? undefined : 0}
          className="transition-[stroke-width] duration-300"
        />
      ))}

      {PORTS.map((port) => {
        const { x, y } = project(port);
        const lit = litPorts.has(port.id);
        const office = port.kind === "kantor";
        const side = port.labelSide ?? "kanan";
        const gap = 10 * markerScale;
        const anchor = side === "kiri" ? "end" : side === "kanan" ? "start" : "middle";
        const labelX = side === "kiri" ? x - gap : side === "kanan" ? x + gap : x;
        const labelY =
          side === "atas" ? y - gap : side === "bawah" ? y + gap * 2 : y + 4 * markerScale;
        return (
          <g key={port.id}>
            <circle
              cx={x}
              cy={y}
              r={(office ? 3.5 : lit ? 7 : 5) * markerScale}
              fill={office ? "#8FA1A8" : lit ? "#FF5A1F" : "#4C6773"}
              className="transition-all duration-300"
            />
            <text
              x={labelX}
              y={labelY}
              textAnchor={anchor}
              fontSize={13 * markerScale}
              fill={lit ? "#F2EFE9" : "#8FA1A8"}
              fontFamily="var(--font-mono)"
              className="transition-colors duration-300"
            >
              {port.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function LegList({ activeIndex }: { activeIndex: number }) {
  return (
    <ol className="mt-8 space-y-4">
      {ROUTE_LEGS.map((leg: RouteLeg, index) => {
        const current = index === activeIndex;
        return (
          <li
            key={leg.id}
            data-testid="label-leg"
            aria-current={current ? "true" : undefined}
            className={`border-l-2 pl-4 transition-colors duration-300 ${
              current ? "border-accent" : "border-surface-3"
            }`}
          >
            <p className={`font-mono text-sm ${current ? "text-ink" : "text-ink-muted"}`}>
              {leg.label}
            </p>
            <p className="mt-1 text-xs text-ink-muted">{leg.note}</p>
          </li>
        );
      })}
    </ol>
  );
}

/** Jalur tanpa pin: peta di atas, daftar lintasan di bawah, semua leg tergambar. */
function StaticRouteMap() {
  return (
    <section className="bg-surface-2 py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <SectionHeader
          title="Rute Penyeberangan Ro-Ro"
          description="Lima lintasan yang menghubungkan Sumatera, Jawa, Bali, Lombok, dan Kalimantan Tengah."
        />
        <div className="mt-10 aspect-3/2 w-full overflow-hidden rounded-card bg-surface">
          <RouteSvg activeIndex={-1} drawn markerScale={2.3} />
        </div>
        <LegList activeIndex={-1} />
      </div>
    </section>
  );
}

export function RouteMap() {
  const stageRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<SVGSVGElement | null>(null);
  const legRefs = useRef<(SVGPathElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();
  const isDesktop = useIsDesktop();
  const animated = isDesktop && !reduced;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const stage = stageRef.current;
    const map = mapRef.current;
    if (!animated || !stage || !map) return;
    registerGsap();

    const ctx = gsap.context(() => {
      const legs = legRefs.current.filter((el): el is SVGPathElement => el !== null);
      for (const leg of legs) {
        const length = leg.getTotalLength();
        gsap.set(leg, { strokeDasharray: length, strokeDashoffset: length });
      }

      let lastIndex = -1;
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: PIN_LENGTH,
          pin: true,
          scrub: MOTION.scrub,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const index = activeLegIndex(self.progress, ROUTE_LEGS.length);
            if (index !== lastIndex) {
              lastIndex = index;
              setActiveIndex(index);
            }
          },
        },
      });

      // Zoom pelan sepanjang seluruh timeline, termasuk selama jeda akhir.
      // Alasannya satu kalimat: jeda yang benar-benar diam terbaca sebagai
      // halaman menggantung, sedangkan gerak sangat lambat terbaca sebagai
      // kamera yang sedang menutup adegan.
      timeline.fromTo(
        map,
        { scale: 1, transformOrigin: "50% 50%" },
        { scale: 1.14, ease: "none", duration: TOTAL },
        0,
      );

      legs.forEach((leg, index) => {
        timeline.to(
          leg,
          { strokeDashoffset: 0, ease: "power1.inOut", duration: LEG_DURATION },
          INTRO + index * LEG_GAP,
        );
      });

      // Jeda akhir eksplisit. Tanpa tween kosong ini, durasi timeline berhenti
      // di detik selesainya leg terakhir dan scrub memetakan akhir pin ke sana.
      timeline.to({}, { duration: HOLD }, TOTAL - HOLD);
    }, stageRef);

    return () => ctx.revert();
  }, [animated]);

  if (!animated) return <StaticRouteMap />;

  return (
    <section className="relative bg-surface-2">
      <div ref={stageRef} className="relative h-[100dvh] overflow-hidden">
        <div className="absolute inset-0">
          <RouteSvg mapRef={mapRef} legRefs={legRefs} activeIndex={activeIndex} drawn={false} />
        </div>

        <div className="relative z-10 mx-auto grid h-full max-w-[1400px] grid-cols-12 content-center px-4 md:px-8">
          <div className="col-span-12 rounded-card border border-surface-3 bg-surface/85 p-6 backdrop-blur-sm md:col-span-4 md:p-8">
            <SectionHeader
              title="Rute Penyeberangan Ro-Ro"
              description="Lima lintasan yang menghubungkan Sumatera, Jawa, Bali, Lombok, dan Kalimantan Tengah."
            />
            <LegList activeIndex={activeIndex} />
          </div>
        </div>
      </div>
    </section>
  );
}
