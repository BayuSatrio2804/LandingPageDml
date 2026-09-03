import { MEDIA } from "@/lib/media/manifest";
import { OverlayPanel } from "@/components/ui/overlay-panel";
import { DayCutMedia } from "./day-cut-media";
import { HOME_SECTIONS_DEFAULTS } from "./home-sections-defaults";

export function DayCut({
  copy = HOME_SECTIONS_DEFAULTS.dayCut,
}: {
  copy?: { heading: string; body: string };
}) {
  const frame = MEDIA["hari"][0];
  if (!frame) {
    throw new Error("MEDIA['hari'] harus punya minimal 1 frame");
  }

  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden bg-surface-2-wash">
      <DayCutMedia frame={frame} />
      <div className="absolute inset-0 bg-gradient-to-r from-surface-2/75 via-surface-2/25 to-transparent" />
      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] grid-cols-12 px-4 md:px-8">
        <OverlayPanel className="col-span-12 md:col-span-6 lg:col-span-5">
          <h2 className="font-display text-pretty text-2xl font-bold text-ink md:text-3xl">
            {copy.heading}
          </h2>
          <p className="mt-4 max-w-[50ch] text-lg leading-relaxed text-ink md:text-xl">
            {copy.body}
          </p>
        </OverlayPanel>
      </div>
    </section>
  );
}
