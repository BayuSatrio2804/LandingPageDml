import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { ABOUT_PAGE_DEFAULTS, type AboutPageData } from "./about-defaults";

/** Server component: gerak satu-satunya memakai Reveal yang sudah ada di repo. */
export function AboutCta({
  copy = ABOUT_PAGE_DEFAULTS.cta,
}: {
  copy?: AboutPageData["cta"];
}) {
  return (
    <section
      aria-labelledby="about-cta-title"
      className="relative overflow-hidden bg-linear-150 from-dark-field via-dark-field-lift to-dark-field-deep py-29"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(52%_62%_at_50%_8%,rgb(91_132_200/0.22)_0%,transparent_66%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-16 [background-image:linear-gradient(90deg,rgb(255_255_255/0.5)_1px,transparent_1px)] [background-size:118px_100%] [mask-image:radial-gradient(62%_70%_at_50%_50%,#000_0%,transparent_76%)]"
      />
      <Reveal className="relative mx-auto max-w-350 px-8 text-center">
        <h2
          id="about-cta-title"
          className="mx-auto m-0 max-w-[22ch] font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.04] font-bold tracking-[-0.02em] text-on-accent text-pretty"
        >
          {copy.heading}
        </h2>
        <div className="mt-9 flex flex-wrap justify-center gap-3.5">
          <Link
            href="/bisnis"
            className="inline-flex items-center gap-2.5 rounded-full bg-surface-2 px-7 py-3.5 text-sm font-medium text-accent transition-all hover:gap-4 hover:bg-on-accent hover:text-accent-hover"
          >
            {copy.primaryButtonLabel} <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/kontak"
            className="inline-flex items-center gap-2.5 rounded-full border border-on-accent/50 px-7 py-3.5 text-sm font-medium text-on-accent transition-all hover:gap-4 hover:bg-on-accent/12"
          >
            {copy.secondaryButtonLabel} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
