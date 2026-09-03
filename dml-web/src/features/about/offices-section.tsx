"use client";

import type { Office } from "@/content/types";
import { useSectionMotion } from "@/lib/motion/use-section-motion";
import { revealBatch } from "@/lib/motion/reveal-batch";
import { ABOUT_PAGE_DEFAULTS, type AboutPageData } from "./about-defaults";

/**
 * Kantor DML dan kantor grup ditampilkan di satu kisi tetapi DIBEDAKAN lewat
 * warna garis atas dan label pemiliknya. Menyatukannya tanpa pembeda akan
 * membuat alamat Bakrie Tower terbaca sebagai kantor DML.
 *
 * `offices`/`groupOffices` diterima sebagai props: komponen ini "use client"
 * dan datanya sekarang datang dari CMS lewat halaman Tentang Kami.
 */
export function OfficesSection({
  offices: dmlOffices,
  groupOffices,
  copy = ABOUT_PAGE_DEFAULTS.offices,
}: {
  offices: Office[];
  groupOffices: Office[];
  copy?: AboutPageData["offices"];
}) {
  const root = useSectionMotion<HTMLElement>((scope) => {
    revealBatch(scope);
  });

  const offices = [
    ...dmlOffices.map((office) => ({ ...office, owner: copy.dmlOwnerLabel, isDml: true })),
    ...groupOffices.map((office) => ({ ...office, owner: copy.groupOwnerLabel, isDml: false })),
  ];

  return (
    <section
      ref={root}
      id="kantor"
      data-index-section="kantor"
      aria-labelledby="offices-title"
      className="relative overflow-hidden bg-surface-2 py-28"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(64%_68%_at_50%_100%,var(--color-surface)_0%,transparent_62%)]"
      />
      <div className="relative mx-auto max-w-350 px-8">
        <h2
          id="offices-title"
          data-reveal="clip"
          className="m-0 text-center font-display text-[clamp(1.9rem,3.2vw,2.85rem)] leading-[1.05] font-bold tracking-[-0.02em] text-ink"
        >
          {copy.heading}
        </h2>
        <p data-reveal="" className="mx-auto mt-4.5 mb-0 max-w-[54ch] text-center text-base leading-[1.7] text-ink-muted">
          {copy.intro}
        </p>

        <div className="mt-13 grid grid-cols-[repeat(auto-fit,minmax(290px,1fr))] gap-6.5">
          {offices.map((office) => (
            <article
              key={`${office.owner}-${office.label}`}
              data-reveal=""
              data-reveal-group="office"
              className={`flex flex-col gap-3.5 rounded-[14px] border-t-3 bg-surface p-7 transition-[transform,box-shadow] duration-400 hover:-translate-y-1 hover:shadow-[0_26px_52px_-38px_rgb(15_27_46/0.55)] ${
                office.isDml ? "border-t-accent" : "border-t-line"
              }`}
            >
              <div>
                <p
                  className={`m-0 font-mono text-[10px] tracking-[0.18em] uppercase ${
                    office.isDml ? "text-accent" : "text-line"
                  }`}
                >
                  {office.owner}
                </p>
                <p className="mt-2.5 mb-0 font-display text-base font-bold text-ink">{office.label}</p>
              </div>
              <address className="m-0 text-sm leading-[1.7] text-ink-muted not-italic">
                {office.street}
                <br />
                {office.city}
              </address>
              {office.phone ? (
                <p className="m-0 font-mono text-[13px] text-accent">{office.phone}</p>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
