"use client";

import { gsap } from "@/lib/motion/gsap";
import { groupedLegalDocuments } from "@/content/about";
import type { LegalDocument, Membership, StandardCluster } from "@/content/types";
import { useSectionMotion } from "@/lib/motion/use-section-motion";
import { revealBatch } from "@/lib/motion/reveal-batch";

export function LegalSection({
  legalDocuments,
  standards,
  memberships,
}: {
  legalDocuments: LegalDocument[];
  standards: StandardCluster[];
  memberships: Membership[];
}) {
  const groups = groupedLegalDocuments(legalDocuments);

  const root = useSectionMotion<HTMLElement>((scope) => {
    revealBatch(scope);
  });

  /*
   * Sapuan hover ditangani GSAP, bukan hover: variant Tailwind, karena easing
   * masuk dan keluarnya berbeda (expo.out lalu power2.in). Satu transition CSS
   * hanya bisa memberi satu kurva untuk kedua arah.
   */
  const hover = (on: boolean) => (event: React.MouseEvent<HTMLElement>) => {
    const wipe = event.currentTarget.querySelector("[data-wipe]");
    if (!wipe) return;
    gsap.to(wipe, {
      scaleX: on ? 1 : 0,
      duration: on ? 0.55 : 0.35,
      ease: on ? "expo.out" : "power2.in",
    });
  };

  const totalDocs = groups.reduce((sum, group) => sum + group.docs.length, 0);

  return (
    <section
      ref={root}
      id="legal"
      data-index-section="legal"
      aria-labelledby="legal-title"
      className="relative overflow-hidden bg-surface py-28"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(56%_62%_at_6%_12%,var(--color-surface-2)_0%,transparent_58%),radial-gradient(46%_56%_at_96%_88%,var(--color-accent-soft)_0%,transparent_60%)]"
      />
      <div className="relative mx-auto max-w-350 px-8">
        <h2
          id="legal-title"
          data-reveal="clip"
          className="m-0 text-center font-display text-[clamp(1.9rem,3.2vw,2.85rem)] leading-[1.05] font-bold tracking-[-0.02em] text-ink"
        >
          Legalitas dan Sertifikasi
        </h2>

        <div className="mt-14 grid grid-cols-[1.5fr_1fr] items-start gap-14 max-lg:grid-cols-1 max-lg:gap-10">
          <div
            data-reveal=""
            className="overflow-hidden rounded-[14px] bg-surface-2 shadow-[0_24px_54px_-44px_rgb(15_27_46/0.5)]"
          >
            <p className="m-0 border-b border-accent-soft px-6.5 py-5 font-mono text-[11px] tracking-[0.16em] text-line uppercase">
              {totalDocs} dokumen resmi · {groups.length} kelompok
            </p>

            {groups.map((group) => (
              <section key={group.id}>
                <div className="flex items-baseline justify-between gap-4 border-b border-accent-soft bg-surface/60 px-6.5 py-3.25">
                  <h3 className="m-0 font-display text-[13px] font-bold tracking-[-0.01em] text-accent">
                    {group.label}
                  </h3>
                  <span className="font-mono text-[11px] tracking-[0.14em] text-line">
                    {group.docs.length} dokumen
                  </span>
                </div>
                {group.docs.map((doc) => (
                  <div
                    key={doc.document}
                    onMouseEnter={hover(true)}
                    onMouseLeave={hover(false)}
                    className="relative overflow-hidden border-b border-accent-soft"
                  >
                    <span
                      data-wipe=""
                      aria-hidden="true"
                      className="absolute inset-0 origin-left scale-x-0 bg-accent/5"
                    />
                    <div className="relative grid grid-cols-[1fr_auto] items-baseline gap-6 px-6.5 py-3.75 max-sm:grid-cols-1 max-sm:gap-2">
                      <div>
                        <p className="m-0 text-[15px] leading-[1.4] text-ink">{doc.document}</p>
                        <p className="mt-1.25 mb-0 text-[13px] leading-[1.5] text-ink-muted">
                          {doc.issuer}
                        </p>
                      </div>
                      <p className="m-0 font-mono text-[13px] whitespace-nowrap text-accent">
                        {doc.number}
                      </p>
                    </div>
                  </div>
                ))}
              </section>
            ))}
          </div>

          <div className="flex flex-col gap-8">
            <div
              data-reveal=""
              className="rounded-[14px] bg-surface-2 p-6.5 shadow-[0_24px_54px_-44px_rgb(15_27_46/0.5)]"
            >
              <p className="m-0 font-mono text-[11px] tracking-[0.16em] text-line uppercase">
                Standar yang diterapkan
              </p>
              <div className="mt-5 flex flex-col gap-5.5">
                {standards.map((cluster) => (
                  <div key={cluster.label}>
                    <p className="m-0 text-sm text-ink">{cluster.label}</p>
                    <ul className="mt-3 flex list-none flex-wrap gap-2 p-0">
                      {cluster.items.map((item) => (
                        <li
                          key={item.name}
                          title={
                            item.source !== "cp-pdf"
                              ? "Dari riset publik, belum tercantum di company profile resmi"
                              : "Tercantum di company profile resmi"
                          }
                          className="inline-flex items-center gap-2 rounded-full bg-surface px-3.75 py-1.75 font-mono text-xs text-accent"
                        >
                          {item.name}
                          {item.source !== "cp-pdf" ? (
                            <span
                              aria-label="belum tercantum di company profile resmi"
                              className="block size-1.25 rounded-full bg-line"
                            />
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <p className="m-0 text-xs leading-[1.6] text-line">
                  Titik abu menandai standar yang belum tercantum di company profile resmi dan masih
                  menunggu konfirmasi.
                </p>
              </div>
            </div>

            <div
              data-reveal=""
              className="rounded-[14px] bg-surface-2 p-6.5 shadow-[0_24px_54px_-44px_rgb(15_27_46/0.5)]"
            >
              <p className="m-0 font-mono text-[11px] tracking-[0.16em] text-line uppercase">
                Keanggotaan
              </p>
              <ul className="mt-4.5 flex list-none flex-col gap-3.5 p-0">
                {memberships.map((membership) => (
                  <li key={membership.name}>
                    <p className="m-0 text-sm text-ink">{membership.name}</p>
                    {membership.expansion ? (
                      <p className="mt-1 mb-0 text-xs leading-[1.5] text-line">{membership.expansion}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
