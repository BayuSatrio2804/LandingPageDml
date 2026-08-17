import type { Metadata } from "next";
import { COMPANY } from "@/content/company";
import { FOOTER_GROUPS } from "@/content/navigation";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, safeJsonLdString } from "@/lib/seo/json-ld";
import { ExternalLink } from "@/components/layout/external-link";
import { ContactForm } from "@/features/inquiry/contact-form";

const BUSINESS_LINES = FOOTER_GROUPS.find((group) => group.heading === "Bisnis")?.items ?? [];

export const metadata: Metadata = buildMetadata({
  title: "Kontak | PT Dutabahari Menara Line",
  description: "Hubungi PT Dutabahari Menara Line untuk pertanyaan umum, kerja sama, atau informasi armada.",
  path: "/kontak",
});

export default function KontakPage() {
  const whatsappNumber = process.env.WHATSAPP_NUMBER;
  if (!whatsappNumber) {
    throw new Error("WHATSAPP_NUMBER belum diset, redirect WhatsApp di /kontak akan rusak diam-diam.");
  }
  const trail = breadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Kontak", path: "/kontak" },
  ]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
      <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Kontak</h1>
      <p className="mt-4 max-w-[55ch] text-ink-muted">
        Isi form di bawah untuk pertanyaan umum. Tim kami akan menghubungi lewat WhatsApp.
      </p>

      <div className="mt-12 grid gap-12 md:grid-cols-[3fr_2fr]">
        <ContactForm whatsappNumber={whatsappNumber} />

        <address className="space-y-8 not-italic">
          {COMPANY.offices.map((office) => (
            <div key={office.street}>
              <p className="font-display font-bold text-ink">{office.label}</p>
              <p className="mt-1 text-sm text-ink-muted">{office.street}</p>
              <p className="text-sm text-ink-muted">
                {office.city} {office.postalCode}, {office.province}
              </p>
              <ExternalLink
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${office.street}, ${office.city}, ${office.province}`,
                )}`}
                label="Buka di Google Maps"
                className="mt-2 inline-flex items-center gap-1 text-sm text-accent hover:text-accent-hover"
              />
            </div>
          ))}
          <div>
            <p className="font-display font-bold text-ink">Telepon</p>
            <p className="mt-1 text-sm text-ink-muted">{COMPANY.phone}</p>
          </div>
        </address>
      </div>

      <section className="mt-16 border-t border-surface-3 pt-10">
        <h2 className="font-display text-xl font-bold">Kontak per Divisi</h2>
        <p className="mt-2 max-w-[60ch] text-sm text-ink-muted">
          Ketiga lini bisnis kami saat ini melayani lewat satu nomor kontak yang sama.
          Halaman detail tiap lini menyusul di plan berikutnya.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {BUSINESS_LINES.map((line) => (
            <li key={line.label} className="rounded-card border border-surface-3 bg-surface-2 p-5">
              <p className="font-display font-bold text-ink">{line.label}</p>
              <p className="mt-2 text-sm text-ink-muted">{COMPANY.phone}</p>
            </li>
          ))}
        </ul>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(trail) }}
      />
    </div>
  );
}
