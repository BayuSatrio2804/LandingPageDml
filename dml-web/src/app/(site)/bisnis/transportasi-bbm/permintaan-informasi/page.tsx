import type { Metadata } from "next";
import { getCompanyProfile } from "@/lib/cms/company";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, safeJsonLdString } from "@/lib/seo/json-ld";
import { BusinessInquiryForm } from "@/features/inquiry/business-inquiry-form";
import type { BusinessInquiryInput } from "@/features/inquiry/schema";

export const metadata: Metadata = buildMetadata({
  title: "Permintaan Informasi Bisnis | PT Dutabahari Menara Line",
  description:
    "Ajukan permintaan informasi untuk transportasi BBM atau penyeberangan ro-ro PT Dutabahari Menara Line.",
  path: "/bisnis/transportasi-bbm/permintaan-informasi",
});

const SERVICES: BusinessInquiryInput["service"][] = ["transportasi-bbm", "penumpang-roro"];

/**
 * Prefill lewat ?layanan=. Nilai yang tidak dikenali diabaikan diam-diam dan
 * field kembali ke default, bukan melempar galat: tautan lama atau salah ketik
 * tidak boleh membuat halaman form gagal dibuka. Nilai query juga tidak pernah
 * dipakai merangkai teks yang ditampilkan.
 *
 * searchParams adalah Promise di Next 16, jadi halaman ini async.
 */
function resolveService(raw: string | string[] | undefined): BusinessInquiryInput["service"] {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return SERVICES.find((service) => service === value) ?? "transportasi-bbm";
}

export default async function PermintaanInformasiPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const defaultService = resolveService(params.layanan);
  const COMPANY = await getCompanyProfile();

  const trail = breadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Bisnis Kami", path: "/bisnis" },
    { name: "Transportasi BBM", path: "/bisnis/transportasi-bbm" },
    {
      name: "Permintaan Informasi",
      path: "/bisnis/transportasi-bbm/permintaan-informasi",
    },
  ]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
      <h1 className="font-display text-pretty text-4xl font-bold tracking-tight md:text-5xl">
        Permintaan Informasi Bisnis
      </h1>
      <p className="mt-4 max-w-[60ch] text-ink-muted">
        Isi form di bawah untuk kebutuhan pengangkutan atau kerja sama. Tim kami akan
        menghubungi lewat WhatsApp. Tiga field terakhir opsional, kirim saja meski
        volumenya belum pasti.
      </p>

      <div className="mt-12 grid gap-12 md:grid-cols-[3fr_2fr]">
        <BusinessInquiryForm
          whatsappNumber={COMPANY.whatsapp}
          defaultService={defaultService}
        />
        <aside className="space-y-6 text-sm text-ink-muted">
          <div>
            <p className="font-display font-bold text-ink">Kontak langsung</p>
            <p className="mt-1">{COMPANY.phone}</p>
          </div>
          {COMPANY.offices.map((office) => (
            <div key={office.street}>
              <p className="font-display font-bold text-ink">{office.label}</p>
              <p className="mt-1">{office.street}</p>
              <p>
                {office.city} {office.postalCode ? `${office.postalCode}, ` : ""}
                {office.province}
              </p>
            </div>
          ))}
        </aside>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(trail) }}
      />
    </div>
  );
}
