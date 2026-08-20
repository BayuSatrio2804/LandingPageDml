"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";
import { useIsDesktop } from "@/lib/motion/use-is-desktop";
import { useElementHandle, useInViewport } from "@/lib/motion/use-in-viewport";
import { useScrollProgress } from "@/lib/motion/use-scroll-progress";
import { FLEET_CLASSES } from "@/content/fleet";
import { BlueprintSvg } from "@/features/fleet/blueprint-svg";
import { FleetSpecTable } from "@/features/fleet/spec-table";
import { SectionHeader } from "@/components/ui/section-header";

const FleetCanvas = dynamic(() => import("./fleet-3d/fleet-canvas").then((mod) => mod.FleetCanvas), {
  ssr: false,
});

/**
 * Panjang scroll pin. Lima kelas dengan jeda diam 65 persen per iris berarti
 * tiap kelas berdiri tenang sekitar 45 persen tinggi viewport sebelum
 * menyeberang, dan kelas terakhir berdiri penuh selama 68 persen viewport
 * terakhir. Itu yang membuat Ro-Ro Ferry tidak lagi lewat sekejap tepat saat
 * pin dilepas.
 */
const PIN_LENGTH = "+=340%";

function SpecBlock() {
  return (
    <section className="bg-surface-wash pb-24 md:pb-32">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <h3 className="font-display text-xl font-bold text-ink">Spesifikasi per kelas</h3>
        <FleetSpecTable fleetClasses={FLEET_CLASSES} />
        <p className="mt-6 max-w-[70ch] text-xs text-ink-muted">
          Panjang, DWT, dan kapasitas per kelas adalah estimasi proporsional dan masih menunggu
          konfirmasi data teknis dari klien.
        </p>
      </div>
    </section>
  );
}

/** Jalur tanpa 3D: blueprint dua kolom, tidak ada yang dipaku. */
function StaticFleet() {
  return (
    <section className="bg-surface-wash py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <SectionHeader
          title="Perbandingan Armada"
          description="Lima kelas kapal, dari SPOB terkecil sampai motor tanker terbesar, dalam satu skala."
        />
        <div className="mt-12">
          <BlueprintSvg fleetClasses={FLEET_CLASSES} />
        </div>
      </div>
    </section>
  );
}

export function FleetComparator() {
  const [stageNode, attachStage, stageRef] = useElementHandle<HTMLDivElement>();
  const reduced = usePrefersReducedMotion();
  const isDesktop = useIsDesktop();
  const canvasEnabled = isDesktop && !reduced;
  const [activeIndex, setActiveIndex] = useState(0);
  const { inViewport, hasEntered } = useInViewport(stageNode);

  const progressRef = useScrollProgress(stageRef, {
    end: PIN_LENGTH,
    pin: true,
    disabled: !canvasEnabled,
  });

  const handleActiveIndexChange = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  if (!canvasEnabled) {
    return (
      <>
        <StaticFleet />
        <SpecBlock />
      </>
    );
  }

  const active = FLEET_CLASSES[activeIndex] ?? FLEET_CLASSES[0];

  return (
    <>
      <section className="bg-surface-wash relative">
        {/*
          Yang dipaku adalah panggung setinggi tepat satu viewport. Sebelumnya
          seluruh <section> yang dipaku, dan section itu memuat tabel
          spesifikasi di bawah kanvas, jadi tinggi totalnya melebihi viewport:
          begitu pin dilepas, bagian bawah section yang belum pernah terlihat
          barulah menggulir masuk, dan itu yang terbaca sebagai halaman kosong
          yang harus di-scroll lagi.
        */}
        <div ref={attachStage} data-testid="panggung-armada" className="relative h-[100dvh] overflow-hidden">
          <div className="mx-auto grid h-full max-w-[1400px] grid-cols-12 items-center gap-8 px-4 md:px-8">
            <div className="col-span-4">
              <SectionHeader
                title="Perbandingan Armada"
                description="Lima kelas kapal dalam satu skala tetap. Grid di bawah lambung tidak pernah berubah ukuran."
              />

              {/* Rel kelas. Alasannya satu kalimat: tanpa penanda posisi,
                  pergantian kapal terbaca sebagai halaman yang berubah
                  sendiri, bukan sebagai urutan yang sedang dijalani. */}
              <ol className="mt-10 space-y-1" aria-label="Urutan kelas kapal">
                {FLEET_CLASSES.map((fleetClass, index) => {
                  const current = index === activeIndex;
                  return (
                    <li
                      key={fleetClass.slug}
                      data-testid="rel-kelas"
                      aria-current={current ? "true" : undefined}
                      // Butir tidak aktif memakai token ink-muted apa adanya,
                      // tanpa modifier opasitas. ink-muted di atas surface
                      // sekitar 7:1, tapi pada 60 persen ia jatuh ke sekitar
                      // 3,3:1, di bawah ambang AA untuk teks 12 px. Nama kelas
                      // kapal adalah konten, bukan dekorasi, dan penanda aktif
                      // sudah dibawa oleh garis aksen di sebelahnya.
                      className={`flex items-center gap-3 font-mono text-xs transition-colors duration-300 ${
                        current ? "text-ink" : "text-ink-muted"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`h-px transition-all duration-300 ${
                          current ? "w-8 bg-accent" : "w-4 bg-line"
                        }`}
                      />
                      {fleetClass.name}
                    </li>
                  );
                })}
              </ol>

              {active ? (
                <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 font-mono text-sm">
                  <div className="col-span-2">
                    <dt className="text-ink-muted">Kelas</dt>
                    <dd className="mt-1 font-display text-2xl font-bold text-ink">{active.name}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-muted">Panjang</dt>
                    <dd className="mt-1 text-ink">{active.lengthMeters} m</dd>
                  </div>
                  <div>
                    <dt className="text-ink-muted">Jumlah kapal</dt>
                    <dd className="mt-1 text-ink">{active.vesselCount}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-muted">DWT</dt>
                    <dd className="mt-1 text-ink">
                      {active.dwt === null ? "-" : active.dwt.toLocaleString("id-ID")}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-muted">Kapasitas</dt>
                    <dd className="mt-1 text-ink">{active.capacityLabel}</dd>
                  </div>
                </dl>
              ) : null}
            </div>

            <div className="relative col-span-8 h-[78%]">
              {hasEntered && (
                <FleetCanvas
                  progressRef={progressRef}
                  onActiveIndexChange={handleActiveIndexChange}
                  active={inViewport}
                />
              )}
              <p className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between font-mono text-[11px] text-ink-muted">
                <span>Seret untuk memutar</span>
                {/* Kamera mendekat mengikuti ukuran kelas, jadi kotak grid ikut
                    membesar di layar. Ukuran dunianya tetap 10 m, dan menulisnya
                    di sini yang membuat grid tetap berfungsi sebagai patokan
                    skala alih-alih sekadar tekstur latar. */}
                <span>1 kotak grid = 10 m</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <SpecBlock />
    </>
  );
}
