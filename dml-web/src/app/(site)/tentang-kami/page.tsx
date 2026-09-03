import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, safeJsonLdString } from "@/lib/seo/json-ld";
import { AboutHero } from "@/features/about/about-hero";
import { StatStrip } from "@/features/about/stat-strip";
import { IdentitySection } from "@/features/about/identity-section";
import { CoreValues } from "@/features/about/core-values";
import { GroupChart } from "@/features/about/group-chart";
import { LegalSection } from "@/features/about/legal-section";
import { OfficesSection } from "@/features/about/offices-section";
import { AboutCta } from "@/features/about/about-cta";
import { getCompanyProfile } from "@/lib/cms/company";
import { getLegalDocuments } from "@/lib/cms/legal-documents";

export const metadata: Metadata = buildMetadata({
  title: "Tentang Kami | PT Dutabahari Menara Line",
  description:
    "PT Dutabahari Menara Line, perusahaan pelayaran Banjarmasin sejak 1988: lini kerja, nilai inti, struktur Sinar Alam Corporation, legalitas, dan alamat kantor.",
  path: "/tentang-kami",
});

export default async function TentangKamiPage() {
  const [company, legalDocuments] = await Promise.all([getCompanyProfile(), getLegalDocuments()]);
  const trail = breadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Tentang Kami", path: "/tentang-kami" },
  ]);

  return (
    <>
      <AboutHero />
      <StatStrip
        foundedIso={company.foundedIso}
        vessels={company.fleetSummary.vessels}
        people={company.fleetSummary.people}
        sektorCount={company.groupUnits.length}
      />
      <IdentitySection />
      <CoreValues values={company.values} />
      <GroupChart groupUnits={company.groupUnits} dmlLegalName={company.legalName} />
      <LegalSection
        legalDocuments={legalDocuments}
        standards={company.standards}
        memberships={company.memberships}
      />
      <OfficesSection offices={company.offices} groupOffices={company.groupOffices} />
      <AboutCta />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(trail) }}
      />
    </>
  );
}
