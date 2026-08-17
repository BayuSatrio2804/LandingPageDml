import Image from "next/image";
import { MEDIA, avifSrc } from "@/lib/media/manifest";

export function DayCut() {
  const frame = MEDIA["hari"][0];
  if (!frame) {
    throw new Error("MEDIA['hari'] harus punya minimal 1 frame");
  }

  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-surface-2">
      <Image
        src={avifSrc(frame, 2400)}
        alt={frame.alt}
        fill
        sizes="100vw"
        className="object-cover opacity-70"
      />
      <div className="relative z-10 mx-auto max-w-[1400px] px-4 md:px-8">
        <p className="max-w-[55ch] text-lg leading-relaxed text-ink md:text-xl">
          Ship-to-ship transfer memindahkan BBM langsung antar kapal di tengah perairan,
          tanpa menunggu antrean sandar pelabuhan. Bagi distribusi bahan bakar di Kalimantan,
          ini yang membuat pasokan sampai tepat waktu ke titik yang sulit dijangkau jetty
          konvensional.
        </p>
      </div>
    </section>
  );
}
