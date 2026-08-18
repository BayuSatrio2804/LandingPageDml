import { MEDIA } from "@/lib/media/manifest";
import { OverlayPanel } from "@/components/ui/overlay-panel";
import { DayCutMedia } from "./day-cut-media";

export function DayCut() {
  const frame = MEDIA["hari"][0];
  if (!frame) {
    throw new Error("MEDIA['hari'] harus punya minimal 1 frame");
  }

  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden bg-surface-2">
      <DayCutMedia frame={frame} />
      <div className="absolute inset-0 bg-gradient-to-r from-surface-2/80 via-surface-2/30 to-transparent" />
      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] grid-cols-12 px-4 md:px-8">
        <OverlayPanel className="col-span-12 md:col-span-6 lg:col-span-5">
          <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">
            Ship-to-ship transfer
          </h2>
          <p className="mt-4 max-w-[50ch] text-lg leading-relaxed text-ink md:text-xl">
            Memindahkan bahan bakar langsung antar kapal di tengah perairan, tanpa menunggu
            antrean sandar pelabuhan. Itu yang membuat pasokan sampai tepat waktu ke titik yang
            sulit dijangkau jetty konvensional.
          </p>
        </OverlayPanel>
      </div>
    </section>
  );
}
