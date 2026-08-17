import { Hero } from "@/features/home/hero";
import { DayCut } from "@/features/home/day-cut";
import { BusinessLines } from "@/features/home/business-lines";
import { FleetComparator } from "@/features/home/fleet-comparator";
import { RouteMap } from "@/features/home/route-map";
import { Since1985 } from "@/features/home/since-1985";
import { Certifications } from "@/features/home/certifications";
import { CtaSection } from "@/features/home/cta-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <DayCut />
      <BusinessLines />
      <FleetComparator />
      <RouteMap />
      <Since1985 />
      <Certifications />
      <CtaSection />
    </>
  );
}
