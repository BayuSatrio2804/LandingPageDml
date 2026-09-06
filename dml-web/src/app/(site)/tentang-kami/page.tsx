import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, safeJsonLdString } from "@/lib/seo/json-ld";
import { AboutHero } from "@/features/about/about-hero";
import { StatStrip } from "@/features/about/stat-strip";
import { CoreValues } from "@/features/about/core-values";
import { AfiliasiCards } from "@/features/about/afiliasi-cards";
import { VesselTicker } from "@/features/bisnis/vessel-ticker";
import { KlienMarquee } from "@/features/bisnis/klien-marquee";
import { LegalSection } from "@/features/about/legal-section";
import { AboutCta } from "@/features/about/about-cta";
// IdentitySection, GroupChart, dan OfficesSection tetap nonaktif (bukan
// dihapus). AfiliasiCards / VesselTicker / KlienMarquee dipindah KE SINI dari
// /bisnis atas permintaan klien: halaman /bisnis disembunyikan, tiga blok itu
// yang tetap dipakai.
import { getCompanyProfile } from "@/lib/cms/company";
import { getLegalDocuments } from "@/lib/cms/legal-documents";
import { getAboutPage } from "@/lib/cms/about-page";
import { getBusinessLines } from "@/lib/cms/business-lines";
import { getBusinessPage } from "@/lib/cms/business-page";
import { getVessels } from "@/lib/cms/vessels";
import { getClients } from "@/lib/cms/clients";

export const metadata: Metadata = buildMetadata({
  title: "Tentang Kami | PT Dutabahari Menara Line",
  description:
    "PT Dutabahari Menara Line, perusahaan pelayaran Banjarmasin sejak 1988: nilai inti, perusahaan afiliasi di dalam Sinar Alam Corporation, armada, klien korporat, dan legalitas.",
  path: "/tentang-kami",
});

export default async function TentangKamiPage() {
  const [company, legalDocuments, about, { affiliates }, businessPage, vessels, clients] =
    await Promise.all([
      getCompanyProfile(),
      getLegalDocuments(),
      getAboutPage(),
      getBusinessLines(),
      getBusinessPage(),
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
      <AfiliasiCards affiliates={affiliates} copy={businessPage.afiliasi} />
      <VesselTicker vessels={vessels} />
      <KlienMarquee clients={clients} copy={businessPage.klien} />
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
