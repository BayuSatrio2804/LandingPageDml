import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, safeJsonLdString } from "@/lib/seo/json-ld";
import { AboutHero } from "@/features/about/about-hero";
import { StatStrip } from "@/features/about/stat-strip";
import { CoreValues } from "@/features/about/core-values";
import { AfiliasiCards } from "@/features/about/afiliasi-cards";
import { VesselTicker } from "@/features/about/vessel-ticker";
import { KlienMarquee } from "@/features/about/klien-marquee";
import { LegalSection } from "@/features/about/legal-section";
import { AboutCta } from "@/features/about/about-cta";
// IdentitySection, GroupChart, dan OfficesSection tetap nonaktif (bukan
// dihapus). AfiliasiCards / VesselTicker / KlienMarquee dulu bagian dari
// halaman hub /bisnis yang sudah dihapus (redirect ke halaman ini, lihat
// next.config.ts) -- ketiganya sudah dipindah ke src/features/about/.
import { getCompanyProfile } from "@/lib/cms/company";
import { getLegalDocuments } from "@/lib/cms/legal-documents";
import { getAboutPage } from "@/lib/cms/about-page";
import { getBusinessLines } from "@/lib/cms/business-lines";
import { getAfiliasiKlien } from "@/lib/cms/afiliasi-klien";
import { getVessels } from "@/lib/cms/vessels";
import { getClients } from "@/lib/cms/clients";

export const metadata: Metadata = buildMetadata({
  title: "Tentang Kami | PT Dutabahari Menara Line",
  description:
    "PT Dutabahari Menara Line, perusahaan pelayaran Banjarmasin sejak 1988: nilai inti, perusahaan afiliasi di dalam Sinar Alam Corporation, armada, klien korporat, dan legalitas.",
  path: "/tentang-kami",
});

export default async function TentangKamiPage() {
  const [company, legalDocuments, about, { affiliates }, afiliasiKlien, vessels, clients] =
    await Promise.all([
      getCompanyProfile(),
      getLegalDocuments(),
      getAboutPage(),
      getBusinessLines(),
      getAfiliasiKlien(),
      getVessels(),
      getClients(),
    ]);
  const trail = breadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Tentang Kami", path: "/tentang-kami" },
  ]);

  return (
    <>
      <AboutHero copy={about.hero} />
      <StatStrip
        foundedIso={company.foundedIso}
        vessels={company.fleetSummary.vessels}
        people={company.fleetSummary.people}
        sektorCount={company.groupUnits.length}
        labels={about.statLabels}
      />
      <CoreValues values={company.values} copy={about.coreValues} />
      <AfiliasiCards affiliates={affiliates} copy={afiliasiKlien.afiliasi} />
      <VesselTicker vessels={vessels} />
      <KlienMarquee clients={clients} copy={afiliasiKlien.klien} />
      <LegalSection
        legalDocuments={legalDocuments}
        standards={company.standards}
        memberships={company.memberships}
        copy={about.legal}
      />
      <AboutCta copy={about.cta} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(trail) }}
      />
    </>
  );
}
