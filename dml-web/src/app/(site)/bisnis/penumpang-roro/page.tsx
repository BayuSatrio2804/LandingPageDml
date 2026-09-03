import type { Metadata } from "next";
import Image from "next/image";
import { getCompanyProfile } from "@/lib/cms/company";
import { getBusinessLines } from "@/lib/cms/business-lines";
import { getVessels } from "@/lib/cms/vessels";
import { getFleetClasses } from "@/lib/cms/fleet-classes";
import { MEDIA, avifSrc } from "@/lib/media/manifest";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, safeJsonLdString, serviceJsonLd } from "@/lib/seo/json-ld";
import { SectionHeader } from "@/components/ui/section-header";
import { ExternalLink } from "@/components/layout/external-link";
import { RouteTable } from "@/features/fleet/route-table";
import { VesselRoster } from "@/features/fleet/vessel-roster";

export const metadata: Metadata = buildMetadata({
  title: "Penyeberangan Ro-Ro | PT Dutabahari Menara Line",
  description:
    "Sembilan kapal ro-ro PT Dutabahari Menara Line di lima lintasan yang menghubungkan Jawa, Bali, Lombok, dan Kalimantan Tengah.",
  path: "/bisnis/penumpang-roro",
});

export default async function PenumpangRoroPage() {
  const [COMPANY, { mainLines }, vessels, fleetClasses] = await Promise.all([
    getCompanyProfile(),
    getBusinessLines(),
    getVessels(),
    getFleetClasses(),
  ]);
  const RORO_CLASSES = fleetClasses.filter((fleetClass) => fleetClass.category === "Penumpang Ro-Ro");
  const trail = breadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Bisnis Kami", path: "/bisnis" },
    { name: "Penyeberangan Ro-Ro", path: "/bisnis/penumpang-roro" },
  ]);
  const line = mainLines.find((entry) => entry.id === "penumpang-roro");
  const hero = MEDIA["bisnis"].find((frame) => frame.id === "lini-roro") ?? null;
  const service = serviceJsonLd(COMPANY, {
    name: "Penyeberangan Ro-Ro",
    description: line?.summary ?? "",
    path: "/bisnis/penumpang-roro",
  });

  return (
    <div>
      <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
        <p className="font-mono text-xs text-ink-muted">Lini utama</p>
        <h1 className="mt-4 font-display text-pretty text-4xl font-bold tracking-tight md:text-5xl">
          Penyeberangan Ro-Ro
        </h1>
        <p className="mt-6 max-w-[60ch] text-ink-muted">{line?.summary}</p>
        {hero ? (
          <Image
            src={avifSrc(hero, 1600)}
            alt={hero.alt}
            width={1600}
            height={900}
            sizes="(min-width: 1400px) 1400px, 100vw"
            className="mt-10 aspect-[16/9] w-full rounded-card object-cover"
          />
        ) : null}
      </div>

      <section aria-labelledby="lintasan" className="bg-surface-wash py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <SectionHeader
            id="lintasan"
            title="Lintasan"
            description="Lima lintasan dari company profile halaman 03 dan 04. Kolom operator memisahkan lintasan yang dijalankan sendiri dari lintasan afiliasi."
          />
          <RouteTable dmlLegalName={COMPANY.legalName} vessels={vessels} />
        </div>
      </section>

      <section aria-labelledby="armada-roro" className="bg-surface-2-wash py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <SectionHeader
            id="armada-roro"
            title="Armada Jambo"
            description="Sembilan kapal ro-ro. Panjang dan kapasitas penumpang di bawah berlaku untuk kelas, bukan diukur per kapal."
          />
          <VesselRoster fleetClasses={RORO_CLASSES} vessels={vessels} />
          <dl className="mt-12 grid gap-8 sm:grid-cols-3">
            {RORO_CLASSES.map((fleetClass) => (
              <div key={fleetClass.slug}>
                <dt className="text-sm text-ink-muted">Panjang kelas</dt>
                <dd className="mt-1 font-display text-3xl font-bold text-ink">
                  {fleetClass.lengthMeters}
                  <span className="ml-2 font-sans text-sm font-normal text-ink-muted">meter</span>
                </dd>
                <dt className="mt-6 text-sm text-ink-muted">Kapasitas</dt>
                <dd className="mt-1 font-display text-3xl font-bold text-ink">
                  {fleetClass.capacityLabel}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="tiket" className="bg-surface-wash py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <SectionHeader
            id="tiket"
            title="Pesan tiket"
            description={`Pemesanan tiket ro-ro dilayani lewat BookJambo, kanal resmi ${COMPANY.abbreviation}.`}
          />
          <ExternalLink
            href="https://dutabahari.id"
            label="Buka BookJambo"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover"
          />
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(trail) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(service) }}
      />
    </div>
  );
}
