import type { Metadata } from "next";
import { COMPANY } from "@/content/company";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, safeJsonLdString } from "@/lib/seo/json-ld";
import { ExternalLink } from "@/components/layout/external-link";

export const metadata: Metadata = buildMetadata({
  title: "Karier | PT Dutabahari Menara Line",
  description: "Lowongan kerja di PT Dutabahari Menara Line, perusahaan pelayaran Banjarmasin.",
  path: "/karier",
});

export default function KarierPage() {
  const trail = breadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Karier", path: "/karier" },
  ]);
  const waMessage = "Halo, saya ingin mengirimkan lamaran kerja spontan ke PT Dutabahari Menara Line.";

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
      <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Karier</h1>

      <div className="mt-8 max-w-[60ch] rounded-card border border-surface-3 bg-surface-2 p-8">
        <p className="text-ink">Belum ada lowongan terbuka saat ini.</p>
        <p className="mt-3 text-sm text-ink-muted">
          Kami tetap menerima lamaran spontan. Kirim CV dan posisi yang kamu minati lewat
          WhatsApp, tim kami akan menyimpannya untuk kebutuhan rekrutmen berikutnya.
        </p>
        <ExternalLink
          href={`https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(waMessage)}`}
          label="Kirim lamaran lewat WhatsApp"
          className="mt-6 inline-flex items-center gap-1 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-on-accent hover:bg-accent-hover"
        />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(trail) }}
      />
    </div>
  );
}
