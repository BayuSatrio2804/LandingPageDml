"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";
import { useScrollProgress } from "@/lib/motion/use-scroll-progress";
import { FLEET_CLASSES } from "@/content/fleet";
import { BlueprintSvg } from "@/features/fleet/blueprint-svg";
import { FleetSpecTable } from "@/features/fleet/spec-table";
import { SectionHeader } from "@/components/ui/section-header";

const FleetCanvas = dynamic(() => import("./fleet-3d/fleet-canvas").then((mod) => mod.FleetCanvas), {
  ssr: false,
});

const DESKTOP_QUERY = "(min-width: 768px)";

function subscribeDesktop(onStoreChange: () => void): () => void {
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener("change", onStoreChange);
  return () => mql.removeEventListener("change", onStoreChange);
}

function getDesktopSnapshot(): boolean {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

/**
 * Sama seperti usePrefersReducedMotion: server dan render pertama saat hidrasi
 * belum tahu lebar viewport asli. useSyncExternalStore menjaga snapshot server
 * konsisten untuk render pertama, lalu React sendiri yang menyinkronkannya.
 */
function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribeDesktop, getDesktopSnapshot, () => true);
}

export function FleetComparator() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const isDesktop = useIsDesktop();
  const canvasEnabled = isDesktop && !reduced;
  const [canvasVisible, setCanvasVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const progressRef = useScrollProgress(sectionRef, {
    end: "+=300%",
    pin: true,
    disabled: !canvasEnabled,
  });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !canvasEnabled) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setCanvasVisible(true);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [canvasEnabled]);

  const handleActiveIndexChange = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const active = FLEET_CLASSES[activeIndex] ?? FLEET_CLASSES[0];

  return (
    <section ref={sectionRef} className="relative min-h-[100dvh] bg-surface py-24 md:py-0">
      <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-8 px-4 md:min-h-[100dvh] md:items-center md:px-8">
        <div className="col-span-12 md:col-span-4">
          <SectionHeader
            title="Perbandingan Armada"
            description="Lima kelas kapal, dari SPOB terkecil sampai motor tanker terbesar, dalam satu skala."
          />
          {canvasEnabled && active ? (
            <dl className="mt-12 space-y-4 font-mono text-sm">
              <div>
                <dt className="text-ink-muted">Kelas</dt>
                <dd className="text-2xl text-ink">{active.name}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Panjang</dt>
                <dd className="text-ink">{active.lengthMeters} m</dd>
              </div>
              <div>
                <dt className="text-ink-muted">DWT</dt>
                <dd className="text-ink">{active.dwt === null ? "-" : active.dwt.toLocaleString("id-ID")}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Kapasitas</dt>
                <dd className="text-ink">{active.capacityLabel}</dd>
              </div>
            </dl>
          ) : null}
        </div>

        <div className="col-span-12 md:col-span-8">
          {canvasEnabled ? (
            <div className="h-[60vh] md:h-[75vh]">
              {canvasVisible && (
                <FleetCanvas progressRef={progressRef} onActiveIndexChange={handleActiveIndexChange} />
              )}
            </div>
          ) : (
            <BlueprintSvg fleetClasses={FLEET_CLASSES} />
          )}
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <FleetSpecTable fleetClasses={FLEET_CLASSES} />
      </div>
    </section>
  );
}
