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
import { CtaLink } from "@/components/ui/cta-link";
import { FleetSpecTable } from "@/features/fleet/spec-table";
import { BlueprintSvg } from "@/features/fleet/blueprint-svg";
import { VesselRoster } from "@/features/fleet/vessel-roster";

export const metadata: Metadata = buildMetadata({
  title: "Transportasi BBM | PT Dutabahari Menara Line",
  description:
    "Armada motor tanker, oil barge, SPOB, dan tugboat PT Dutabahari Menara Line untuk distribusi bahan bakar cair ke pelabuhan dan pulau utama Indonesia.",
  path: "/bisnis/transportasi-bbm",
});

export default async function TransportasiBbmPage() {
  const [COMPANY, { mainLines }, vessels, fleetClasses, sub] = await Promise.all([
    getCompanyProfile(),
    getBusinessLines(),
    getVessels(),
    getFleetClasses(),
    getBusinessSubpages(),
  ]);
  const bbm = sub.bbm;
  const STS_STEPS = bbm.steps;
  const BBM_CLASSES = fleetClasses.filter((fleetClass) => fleetClass.category === "Transportasi BBM");
  const trail = breadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Bisnis Kami", path: "/bisnis" },
    { name: "Transportasi BBM", path: "/bisnis/transportasi-bbm" },
  ]);
  const line = mainLines.find((entry) => entry.id === "transportasi-bbm");
  const hero = MEDIA["bisnis"].find((frame) => frame.id === "lini-bbm") ?? null;
  const service = serviceJsonLd(COMPANY, {
    name: "Transportasi BBM",
    description: line?.summary ?? "",
    path: "/bisnis/transportasi-bbm",
  });

  return (
    <div>
      {/*
        Pembuka tipis, bukan panggung sepenuh layar. Hero sepenuh layar milik
        beranda; halaman ini dibaca orang yang sudah tertarik dan sekarang mau
        angka, jadi bidang foto tidak boleh mendorong tabel keluar lipatan.
      */}
      <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
        <p className="font-mono text-xs text-ink-muted">{bbm.eyebrow}</p>
        <h1 className="mt-4 font-display text-pretty text-4xl font-bold tracking-tight md:text-5xl">
          {bbm.title}
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

      <section aria-labelledby="spesifikasi" className="bg-surface-wash py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <SectionHeader
            id="spesifikasi"
            title={bbm.kelasArmadaHeading}
            description={bbm.kelasArmadaDesc}
          />
          <FleetSpecTable fleetClasses={BBM_CLASSES} />
          <p className="mt-4 font-mono text-xs text-ink-muted">{bbm.sumberNote}</p>
          <div className="mt-12">
            <BlueprintSvg fleetClasses={BBM_CLASSES} />
          </div>
        </div>
      </section>

      <section aria-labelledby="roster" className="bg-surface-2-wash py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <SectionHeader
            id="roster"
            title={bbm.daftarKapalHeading}
            description={bbm.daftarKapalDesc}
          />
          <VesselRoster fleetClasses={BBM_CLASSES} vessels={vessels} />
        </div>
      </section>

      <section aria-labelledby="alur-sts" className="bg-surface-wash py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <SectionHeader id="alur-sts" title={bbm.alurHeading} description={bbm.alurDesc} />
          <ol className="mt-10 grid gap-8 md:grid-cols-2">
            {STS_STEPS.map((step, index) => (
              <li key={step.title} className="rounded-card border border-surface-3 bg-surface-2 p-6">
                <p className="font-mono text-xs text-accent">
                  Langkah {index + 1} dari {STS_STEPS.length}
                </p>
                <h3 className="mt-3 font-display text-pretty text-lg font-bold text-ink">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm text-ink-muted">{step.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {MEDIA["alur-sts"].map((frame) => (
              <Image
                key={frame.id}
                src={avifSrc(frame, 1080)}
                alt={frame.alt}
                width={1080}
                height={720}
                sizes="(min-width: 768px) 33vw, 100vw"
                className="aspect-[3/2] w-full rounded-card object-cover"
              />
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="standar" className="bg-surface-2-wash py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <SectionHeader id="standar" title={bbm.standarHeading} />
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {COMPANY.standards.map((cluster) => (
              <div key={cluster.label}>
                <p className="font-mono text-xs text-ink-muted">{cluster.label}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {cluster.items.map((item) => (
                    <li
                      key={item.name}
                      className="rounded-full bg-accent-soft px-3 py-1 text-xs text-accent"
                    >
                      {item.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <CtaLink href="/bisnis/transportasi-bbm/permintaan-informasi?layanan=transportasi-bbm">
              {bbm.ctaLabel}
            </CtaLink>
          </div>
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
