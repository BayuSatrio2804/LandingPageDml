import { Hero } from "@/features/home/hero";
import { DayCut } from "@/features/home/day-cut";
import { BusinessLines } from "@/features/home/business-lines";
import { Affiliates } from "@/features/home/affiliates";
import { FleetComparator } from "@/features/home/fleet-comparator";
import { RouteMap } from "@/features/home/route-map";
import { Since1988 } from "@/features/home/since-1988";
import { Certifications } from "@/features/home/certifications";
import { CtaSection } from "@/features/home/cta-section";

/**
 * Urutan seksi juga urutan ritme visual, dan itu disengaja. Hero adalah bidang
 * gelap berbingkai, seksi dua membuka ke foto penuh layar, seksi tiga panggung
 * dipaku dua bab, seksi empat daftar berpembatas, seksi lima studio teknis,
 * seksi enam peta. Tidak ada dua seksi berurutan yang memakai keluarga tata
 * letak yang sama, yang di Plan 4 justru terjadi tiga kali beruntun di awal
 * halaman.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <DayCut />
      <BusinessLines />
      <Affiliates />
      <FleetComparator />
      <RouteMap />
      <Since1988 />
      <Certifications />
      <CtaSection />
    </>
  );
}
