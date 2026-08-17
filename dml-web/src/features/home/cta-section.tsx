import { CtaLink } from "@/components/ui/cta-link";

export function CtaSection() {
  return (
    <section className="bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-4 text-center md:px-8">
        <h2 className="mx-auto max-w-[20ch] font-display text-3xl font-bold text-ink md:text-5xl">
          Siap membahas kebutuhan pengangkutan atau penyeberangan Anda?
        </h2>
        <div className="mt-8 flex justify-center">
          {/* TODO(plan-bisnis): arahkan ke /bisnis/transportasi-bbm/permintaan-informasi setelah halaman itu dibangun */}
          <CtaLink href="/kontak">Hubungi Kami</CtaLink>
        </div>
      </div>
    </section>
  );
}
