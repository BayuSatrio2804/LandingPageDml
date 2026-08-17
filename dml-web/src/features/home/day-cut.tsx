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
      {/* Scrim: foto siang ini punya klaster highlight terang (air/langit,
          ~x_frac 0.38-0.60 dari lebar foto) tepat di area tengah section,
          tempat teks text-ink kemungkinan besar duduk (section pakai flex
          items-center). Tanpa lapisan ini, teks di atas highlight itu jatuh
          ke ~1.7:1, gagal AA -- lihat laporan fix wave utk perhitungan
          WCAG-nya. Pola sama persis dengan scrim business-lines.tsx
          (gradient absolute inset-0 di antara Image dan konten teks, token
          bg-surface-* yang sama, via default 50%/to-transparent), arah
          diputar ke kanan (bukan ke atas) karena teks di sini rata kiri &
          center vertikal, bukan menempel di bawah kartu seperti
          business-lines. */}
      <div className="absolute inset-0 bg-gradient-to-r from-surface-2 via-surface-2/70 to-transparent" />
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
