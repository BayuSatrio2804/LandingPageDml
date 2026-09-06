import { Hero } from "@/features/home/hero";
import { DayCut } from "@/features/home/day-cut";
import { BusinessLines } from "@/features/home/business-lines";
import { FleetComparator } from "@/features/home/fleet-comparator";
import { RouteMap } from "@/features/home/route-map";
import { CtaSection } from "@/features/home/cta-section";
import { LatestArticles } from "@/features/articles/latest-articles";
import { getCertifications } from "@/lib/cms/certifications";
import { getBusinessLines } from "@/lib/cms/business-lines";
import { getFleetClasses } from "@/lib/cms/fleet-classes";
import { getHomeHero } from "@/lib/cms/home-hero";
import { getHomeSections } from "@/lib/cms/home-sections";

/**
 * Urutan seksi juga urutan ritme visual, dan itu disengaja. Hero adalah bidang
 * gelap berbingkai, seksi dua membuka ke foto penuh layar, seksi tiga panggung
 * dipaku dua bab, seksi empat daftar berpembatas, seksi lima studio teknis,
 * seksi enam peta. Tidak ada dua seksi berurutan yang memakai keluarga tata
 * letak yang sama, yang di Plan 4 justru terjadi tiga kali beruntun di awal
 * halaman.
 *
 * Seksi artikel disisipkan di antara sertifikasi dan CTA karena keduanya
 * beda keluarga tata letak: badge grid, lalu kartu editorial bergambar,
 * lalu bidang teks. Ia hilang seluruhnya kalau koleksi artikel kosong.
 */

/**
 * Jaring kedua untuk build yang berjalan tanpa database. queries.ts sudah
 * mengembalikan daftar kosong alih-alih melempar, jadi build tetap sukses,
 * tapi hasilnya beranda tanpa seksi artikel yang dibekukan sebagai halaman
 * statis. Tanpa baris ini ia bertahan begitu sampai ada publikasi berikutnya
 * yang memicu revalidatePath. Satu jam adalah harga yang murah untuk
 * jaminan bahwa beranda menyembuhkan dirinya sendiri.
 */
export const revalidate = 3600;

export default async function HomePage() {
  const [certifications, { mainLines }, fleetClasses, homeHero, sections] =
    await Promise.all([
      getCertifications(),
      getBusinessLines(),
      getFleetClasses(),
      getHomeHero(),
      getHomeSections(),
    ]);
  return (
    <>
      <Hero certifications={certifications} hero={homeHero} />
      <BusinessLines mainLines={mainLines} />
      <DayCut copy={sections.dayCut} />
      <FleetComparator fleetClasses={fleetClasses} copy={sections.fleetComparator} />
      <RouteMap copy={sections.routeMap} />
      <LatestArticles />
      <CtaSection cta={sections.cta} />
    </>
  );
}
