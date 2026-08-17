import Image from "next/image";
import { CtaLink } from "@/components/ui/cta-link";
import { MEDIA, avifSrc } from "@/lib/media/manifest";
import { HeroCanvas } from "./hero-canvas";
import { HeroHeadline } from "./hero-headline";

export function Hero() {
  const frames = MEDIA["hero-malam"];
  const posterFrame = frames[4];
  if (!posterFrame) {
    throw new Error("MEDIA['hero-malam'] harus punya minimal 5 frame untuk poster tengah");
  }

  return (
    <section id="hero" className="relative flex min-h-[100dvh] items-end overflow-hidden pt-24 pb-16 md:pb-24">
      {/* Poster tetap elemen LCP di setiap kondisi: tanpa JS, saat reduced
          motion, di mobile, dan bahkan saat canvas aktif. Canvas hanya
          menumpuk di atasnya setelah idle, dan poster tidak pernah dilepas
          dari DOM supaya kegagalan WebGL tidak menyisakan layar kosong. */}
      <Image
        data-testid="hero-poster"
        src={avifSrc(posterFrame, 1600)}
        alt={posterFrame.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <HeroCanvas />
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 md:px-8">
        <HeroHeadline>Menggerakkan energi Kalimantan sejak 1985.</HeroHeadline>
        <p data-testid="hero-subteks" className="mt-4 max-w-[45ch] text-ink">
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
