import Image from "next/image";
import { CtaLink } from "@/components/ui/cta-link";
import { MEDIA, avifSrc } from "@/lib/media/manifest";
import { NightSequence } from "./sequence/night-sequence";

export function Hero() {
  const frames = MEDIA["hero-malam"];
  const posterFrame = frames[4];
  if (!posterFrame) {
    throw new Error("MEDIA['hero-malam'] harus punya minimal 5 frame untuk poster tengah");
  }

  return (
    <section className="relative flex min-h-[100dvh] items-end overflow-hidden pt-24 pb-16 md:pb-24">
      <Image
        src={avifSrc(posterFrame, 1600)}
        alt={posterFrame.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <NightSequence frames={frames} />
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 md:px-8">
        <h1 className="max-w-[16ch] font-display text-4xl font-bold tracking-tight text-ink md:text-6xl">
          Menggerakkan energi dan orang di perairan Kalimantan sejak 1985.
        </h1>
        <p className="mt-4 max-w-[45ch] text-ink-muted">
          Armada BBM, penyeberangan ro-ro, dan galangan kapal dalam satu grup pelayaran Banjarmasin.
        </p>
        <div className="mt-8">
          {/* TODO(plan-bisnis): arahkan ke /bisnis/transportasi-bbm/permintaan-informasi setelah halaman itu dibangun */}
          <CtaLink href="/kontak">Hubungi Kami</CtaLink>
        </div>
      </div>
    </section>
  );
}
