import { CtaLink } from "@/components/ui/cta-link";
import { HOME_SECTIONS_DEFAULTS } from "./home-sections-defaults";

export function CtaSection({
  cta = HOME_SECTIONS_DEFAULTS.cta,
}: {
  cta?: { heading: string; buttonLabel: string };
}) {
  return (
    <section className="bg-surface-wash py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-4 text-center md:px-8">
        <h2 className="mx-auto max-w-[20ch] font-display text-pretty text-3xl font-bold text-ink md:text-5xl">
          {cta.heading}
        </h2>
        <div className="mt-8 flex justify-center">
          {/*
            Tetap ke /kontak, dan TODO lamanya dicabut di Plan 9. Halaman
            permintaan informasi B2B memang sudah ada sejak Plan 8, tapi ia
            khusus lini BBM, sementara judul seksi ini menyebut pengangkutan
            DAN penyeberangan. CTA umum yang mendarat di form satu lini
            mempersempit halaman penjualan. Jalur B2B punya pintunya sendiri di
            hero dan di halaman lini.
          */}
          <CtaLink href="/kontak">{cta.buttonLabel}</CtaLink>
        </div>
      </div>
    </section>
  );
}
