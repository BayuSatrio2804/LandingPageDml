import type { BusinessLine } from "@/content/types";
import { Reveal } from "@/components/motion/reveal";
import { HOME_SECTIONS_DEFAULTS } from "./home-sections-defaults";

/**
 * Tiga perusahaan afiliasi, bukan tiga kartu fitur yang sama besar.
 *
 * Company profile menggambarnya sebagai cabang di bawah kotak DML, jadi
 * hierarkinya memang lebih rendah dari dua lini utama di panggung sebelumnya.
 * Baris berpembatas tipis menyampaikan itu; tiga kartu sejajar justru akan
 * membuatnya terbaca setara dengan lini yang dijalankan DML sendiri.
 */
export function Affiliates({
  affiliates,
  copy = HOME_SECTIONS_DEFAULTS.affiliates,
}: {
  affiliates: BusinessLine[];
  copy?: { heading: string; subtext: string };
}) {
  return (
    <section className="bg-surface-2-wash py-20 md:py-28">
      <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-8 px-4 md:px-8">
        <div className="col-span-12 md:col-span-4">
          <h2 className="font-display text-pretty text-2xl font-bold text-ink md:text-3xl">
            {copy.heading}
          </h2>
          <p className="mt-4 max-w-[32ch] text-sm text-ink-muted">{copy.subtext}</p>
        </div>

        <Reveal className="col-span-12 md:col-span-8" stagger={0.08}>
          {affiliates.map((line) => (
            <div
              key={line.id}
              data-testid="baris-afiliasi"
              className="grid grid-cols-12 gap-4 border-t border-surface-3 py-8 first:border-t-0 first:pt-0 md:gap-8"
            >
              <p className="col-span-12 font-display text-lg font-bold text-ink md:col-span-5 md:text-xl">
                {line.title}
              </p>
              <div className="col-span-12 md:col-span-7">
                <p className="max-w-[44ch] text-ink-muted">{line.summary}</p>
                <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs text-ink">
                  {line.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
