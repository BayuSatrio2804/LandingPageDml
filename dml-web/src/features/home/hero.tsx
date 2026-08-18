import Image from "next/image";
import { CtaLink } from "@/components/ui/cta-link";
import { MEDIA, avifSrc } from "@/lib/media/manifest";
import { HeroCanvas } from "./hero-canvas";
import { HeroHeadline } from "./hero-headline";

/**
 * Hero terbagi dua, bukan foto satu layar penuh dengan teks di atasnya.
 *
 * Alasannya bukan selera: sampai Plan 4, tiga seksi pertama beranda semuanya
 * "foto penuh layar plus panel scrim", jadi halaman kehilangan pergantian
 * ritme tepat di tempat yang paling menentukan. Sekarang hero adalah bidang
 * gelap dengan tipografi di kiri dan satu artefak 3D yang dibingkai di kanan,
 * lalu seksi kedua yang membuka ke foto penuh layar. Pergantian itu yang
 * membuat seksi kedua terasa membuka, bukan mengulang.
 *
 * Poster tetap tinggal di dalam bingkai kanan dan tidak pernah dilepas dari
 * DOM: ia yang tampil tanpa JS, saat reduced motion, di mobile, dan sebagai
 * dasar sebelum kanvas selesai dibuat. Kegagalan WebGL menyisakan foto, bukan
 * kotak kosong.
 */
export function Hero() {
  const frames = MEDIA["hero-malam"];
  const posterFrame = frames[4];
  if (!posterFrame) {
    throw new Error("MEDIA['hero-malam'] harus punya minimal 5 frame untuk poster tengah");
  }

  return (
    <section
      id="hero"
      className="relative flex min-h-[100dvh] items-center overflow-hidden bg-surface pt-24 pb-16 md:pb-20"
    >
      {/* Cahaya tunggal di belakang bingkai artefak. Satu gradien radial, bukan
          mesh berwarna: yang dibutuhkan cuma alasan kenapa sisi kanan lebih
          terang dari sisi kiri. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_78%_38%,rgba(255,90,31,0.14),transparent_62%)]"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] grid-cols-12 items-center gap-y-12 px-4 md:gap-x-8 md:px-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-6">
          <HeroHeadline>Mengangkut bahan bakar dan orang, lintas Indonesia.</HeroHeadline>
          <p data-testid="hero-subteks" className="mt-6 max-w-[46ch] text-lg text-ink-muted md:text-xl">
            Armada 64 kapal, lima lintasan penyeberangan, dan bengkel perawatan sendiri,
            dioperasikan dari Banjarmasin sejak 1988.
          </p>
          <div className="mt-10">
            {/* TODO(plan-bisnis): arahkan ke /bisnis/transportasi-bbm/permintaan-informasi setelah halaman itu dibangun */}
            <CtaLink href="/kontak">Hubungi Kami</CtaLink>
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-start-8 lg:col-span-5">
          <div className="relative aspect-4/3 overflow-hidden rounded-card border border-surface-3 bg-surface-2 md:aspect-square">
            <Image
              data-testid="hero-poster"
              src={avifSrc(posterFrame, 1600)}
              alt={posterFrame.alt}
              fill
              priority
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
            <HeroCanvas />
          </div>
        </div>
      </div>
    </section>
  );
}
