import type { Metadata } from "next";
import { COMPANY } from "@/content/company";
import { TIMELINE } from "@/content/timeline";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, safeJsonLdString } from "@/lib/seo/json-ld";
import { AnchorNav } from "@/components/layout/anchor-nav";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = buildMetadata({
  title: "Tentang Kami | PT Dutabahari Menara Line",
  description: "Silsilah dan profil perusahaan PT Dutabahari Menara Line, bagian dari SinarAlam Corporation.",
  path: "/tentang-kami",
});

export default function TentangKamiPage() {
  const trail = breadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Tentang Kami", path: "/tentang-kami" },
  ]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
      <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Tentang Kami</h1>

      <AnchorNav
        items={[
          { id: "silsilah", label: "Silsilah" },
          { id: "profil", label: "Profil" },
        ]}
      />

      <section id="silsilah" className="mt-16 scroll-mt-24">
        <h2 className="font-display text-2xl font-bold">Silsilah</h2>
        <Reveal className="mt-8 space-y-8 border-l border-surface-3 pl-6">
          {TIMELINE.map((entry) => (
            <div key={entry.year}>
              <p className="font-display font-bold text-accent">{entry.year}</p>
              <p className="mt-1 max-w-[60ch] text-ink-muted">{entry.label}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <section id="profil" className="mt-24 scroll-mt-24">
        <h2 className="font-display text-2xl font-bold">Profil Perusahaan</h2>
        <Reveal className="mt-8 grid gap-10 md:grid-cols-2">
          <div>
            {/* draft: visi-misi belum direview klien, konfirmasi sebelum situs live */}
            <h3 className="font-display font-bold text-ink">Visi</h3>
            <p className="mt-2 max-w-[50ch] text-ink-muted">
              Menjadi mitra pelayaran terpercaya di perairan Kalimantan, menghubungkan energi
              dan orang dengan aman dan andal.
            </p>
            <h3 className="mt-6 font-display font-bold text-ink">Misi</h3>
            <p className="mt-2 max-w-[50ch] text-ink-muted">
              Mengoperasikan armada transportasi BBM, penyeberangan ro-ro, dan galangan kapal
              dengan standar keselamatan dan kualitas tertinggi.
            </p>
          </div>
          <div>
            <h3 className="font-display font-bold text-ink">Legalitas dan Sertifikasi</h3>
            <p className="mt-2 text-ink-muted">{COMPANY.legalName}, bagian dari {COMPANY.parent}.</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {COMPANY.certifications.map((cert) => (
                <li
                  key={cert}
                  className="rounded-full border border-surface-3 px-3 py-1 text-xs text-ink-muted"
                >
                  {cert}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(trail) }}
      />
    </div>
  );
}
