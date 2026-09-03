import type { Metadata } from "next";
import Image from "next/image";
import { getCompanyProfile } from "@/lib/cms/company";
import { getBusinessLines } from "@/lib/cms/business-lines";
import { getVessels } from "@/lib/cms/vessels";
import { getFleetClasses } from "@/lib/cms/fleet-classes";
import { getBusinessSubpages } from "@/lib/cms/business-subpages";
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
  const [COMPANY, { mainLines }, vessels, fleetClasses, sub] = await Promise.all([
    getCompanyProfile(),
    getBusinessLines(),
    getVessels(),
    getFleetClasses(),
    getBusinessSubpages(),
  ]);
  const roro = sub.roro;
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
        <p className="font-mono text-xs text-ink-muted">{roro.eyebrow}</p>
        <h1 className="mt-4 font-display text-pretty text-4xl font-bold tracking-tight md:text-5xl">
          {roro.title}
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
          <SectionHeader id="lintasan" title={roro.lintasanHeading} description={roro.lintasanDesc} />
          <RouteTable dmlLegalName={COMPANY.legalName} vessels={vessels} />
        </div>
      </section>

      <section aria-labelledby="armada-roro" className="bg-surface-2-wash py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <SectionHeader id="armada-roro" title={roro.armadaHeading} description={roro.armadaDesc} />
          <VesselRoster fleetClasses={RORO_CLASSES} vessels={vessels} />
          <dl className="mt-12 grid gap-8 sm:grid-cols-3">
            {RORO_CLASSES.map((fleetClass) => (
              <div key={fleetClass.slug}>
                <dt className="text-sm text-ink-muted">{roro.lengthLabel}</dt>
                <dd className="mt-1 font-display text-3xl font-bold text-ink">
                  {fleetClass.lengthMeters}
                  <span className="ml-2 font-sans text-sm font-normal text-ink-muted">
                    {roro.lengthUnit}
                  </span>
                </dd>
                <dt className="mt-6 text-sm text-ink-muted">{roro.capacityLabel}</dt>
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
          <SectionHeader id="tiket" title={roro.tiketHeading} description={roro.tiketDesc} />
          <ExternalLink
            href="https://dutabahari.id"
            label={roro.tiketButtonLabel}
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
