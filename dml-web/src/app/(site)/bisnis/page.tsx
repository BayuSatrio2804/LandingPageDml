import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, safeJsonLdString } from "@/lib/seo/json-ld";
import { BisnisHero } from "@/features/bisnis/bisnis-hero";
import { LiniUtamaRail } from "@/features/bisnis/lini-utama-rail";
import { VesselTicker } from "@/features/bisnis/vessel-ticker";
import { AlurSts } from "@/features/bisnis/alur-sts";
import { AfiliasiRows } from "@/features/bisnis/afiliasi-rows";
import { KlienMarquee } from "@/features/bisnis/klien-marquee";
import { BisnisCta } from "@/features/bisnis/bisnis-cta";
import { SectionIndexRail } from "@/features/bisnis/section-index-rail";
import { getClients } from "@/lib/cms/clients";
import { getBusinessLines } from "@/lib/cms/business-lines";
import { getVessels } from "@/lib/cms/vessels";
import { getBusinessPage } from "@/lib/cms/business-page";

export const metadata: Metadata = buildMetadata({
  title: "Bisnis Kami | PT Dutabahari Menara Line",
  description:
    "Dua lini yang dijalankan langsung PT Dutabahari Menara Line, transportasi BBM dan penyeberangan ro-ro, plus tiga perusahaan afiliasi di dalam Sinar Alam Corporation.",
  path: "/bisnis",
});

export default async function BisnisPage() {
  const [clients, { affiliates }, vessels, page] = await Promise.all([
    getClients(),
    getBusinessLines(),
    getVessels(),
    getBusinessPage(),
  ]);
  const trail = breadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Bisnis Kami", path: "/bisnis" },
  ]);

  return (
    <>
      <BisnisHero copy={page.hero} />
      <LiniUtamaRail copy={page.liniUtama} />
      <VesselTicker vessels={vessels} />
      <AlurSts copy={page.alurSts} />
      <AfiliasiRows affiliates={affiliates} copy={page.afiliasi} />
      <KlienMarquee clients={clients} copy={page.klien} />
      <BisnisCta copy={page.cta} />
      {/*
        Paling bawah dengan sengaja: triggernya menunjuk [data-index-section]
        milik seksi di atasnya, jadi seksi-seksi itu harus sudah ada di DOM
        saat komponen ini membuat ScrollTrigger.
      */}
      <SectionIndexRail labels={page.sectionIndexLabels} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(trail) }}
      />
    </>
  );
}
