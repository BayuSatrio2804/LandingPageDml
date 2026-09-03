import Link from "next/link";
import { getCompanyProfile } from "@/lib/cms/company";
import { Reveal } from "@/components/motion/reveal";
import { BISNIS_PAGE_DEFAULTS, type BisnisPageData } from "./bisnis-defaults";

/**
 * Server component: tidak ada gerak selain Reveal yang sudah ada di repo,
 * jadi tidak perlu "use client" di sini.
 */
export async function BisnisCta({
  copy = BISNIS_PAGE_DEFAULTS.cta,
}: {
  copy?: BisnisPageData["cta"];
}) {
  const company = await getCompanyProfile();
  return (
    <section
      id="kontak"
      data-index-section="kontak"
      aria-labelledby="bisnis-cta-title"
      className="relative overflow-hidden bg-linear-150 from-dark-field via-dark-field-lift to-dark-field-deep py-33"
    >
      <Reveal className="mx-auto max-w-350 px-8">
        <p className="m-0 font-mono text-[11px] tracking-[0.2em] text-surface-3 uppercase">
          {copy.kicker}
        </p>
        <h2
          id="bisnis-cta-title"
          className="mt-4.5 mb-0 max-w-[26ch] font-display text-[clamp(2.25rem,4.6vw,4rem)] leading-[1.02] font-bold tracking-[-0.02em] text-on-accent text-pretty"
        >
          {copy.heading}
        </h2>
        <div className="mt-10 flex flex-wrap gap-3.5">
          <Link
            href="/bisnis/transportasi-bbm/permintaan-informasi"
            className="inline-flex items-center gap-2.5 rounded-full bg-surface-2 px-7 py-3.5 text-sm font-medium text-accent transition-all hover:gap-4 hover:bg-on-accent hover:text-accent-hover"
          >
            {copy.primaryButtonLabel} <span aria-hidden="true">→</span>
          </Link>
          <a
            href={company.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full border border-on-accent/50 px-7 py-3.5 text-sm font-medium text-on-accent transition-all hover:gap-4 hover:bg-on-accent/12"
          >
            {copy.secondaryButtonLabel} <span aria-hidden="true">→</span>
          </a>
        </div>
      </Reveal>
    </section>
  );
}
