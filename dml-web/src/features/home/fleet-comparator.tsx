"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/motion/gsap";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";
import { FLEET_CLASSES } from "@/content/fleet";
import { BlueprintSvg } from "@/features/fleet/blueprint-svg";
import { FleetSpecTable } from "@/features/fleet/spec-table";

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
 * Sama seperti usePrefersReducedMotion: server dan render pertama saat
 * hidrasi belum tahu lebar viewport asli. useState plus setState di dalam
 * effect di sini akan (a) memicu render bertingkat, ditolak aturan
 * react-hooks/set-state-in-effect, dan (b) berisiko mismatch hidrasi karena
 * initializer useState lazy akan membaca matchMedia asli saat render klien
 * pertama, beda dari asumsi server. useSyncExternalStore menghindari
 * keduanya: snapshot server tetap konsisten untuk render pertama, lalu
 * disinkronkan ke nilai asli oleh React sendiri setelah hidrasi selesai.
 */
function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribeDesktop, getDesktopSnapshot, () => true);
}

export function FleetComparator() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef(0);
  const reduced = usePrefersReducedMotion();
  const [canvasVisible, setCanvasVisible] = useState(false);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !isDesktop) return;

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
  }, [isDesktop]);

  useEffect(() => {
    const section = sectionRef.current;
    if (reduced || !section || !isDesktop) return;
    registerGsap();

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=300%",
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          // self.progress is normally already clamped to [0, 1] by
          // ScrollTrigger, but progressRef is the only bridge into the R3F
          // boundary (Rig in fleet-canvas.tsx derives activeIndex from it
          // without its own clamp), and an out-of-range value there
          // silently produces an all-zero opacity array, ie. an invisible
          // canvas. Clamp explicitly as defense-in-depth.
          progressRef.current = Math.min(1, Math.max(0, self.progress));
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reduced, isDesktop]);

  return (
    <section ref={sectionRef} className="relative min-h-screen bg-surface py-16 md:py-0">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <h2 className="font-display text-3xl font-bold text-ink md:text-5xl">Perbandingan Armada</h2>
        <p className="mt-4 max-w-[55ch] text-ink-muted">
          Lima kelas kapal, dari SPOB terkecil sampai motor tanker terbesar, dalam satu skala.
        </p>
      </div>

      {isDesktop && !reduced ? (
        <div className="relative mt-8 h-[60vh] md:h-[70vh]">
          {canvasVisible && <FleetCanvas progressRef={progressRef} />}
        </div>
      ) : (
        <div className="mt-8">
          <BlueprintSvg fleetClasses={FLEET_CLASSES} />
        </div>
      )}

      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <FleetSpecTable fleetClasses={FLEET_CLASSES} />
      </div>
    </section>
  );
}
