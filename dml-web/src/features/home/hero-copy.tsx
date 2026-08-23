"use client";

import Image from "next/image";
import { CtaLink } from "@/components/ui/cta-link";
import { CERT_BADGES } from "@/content/certifications";
import { DOORS } from "./hero-doors";

// Halaman tujuan dibangun Plan 8. Label CTA-nya sudah "Permintaan Informasi
// BBM" sejak awal, jadi ini bukan perubahan desain, melainkan penutupan TODO
// yang menunggu halamannya ada.
const CTA_BBM_HREF = "/bisnis/transportasi-bbm/permintaan-informasi";

export function HeroCopy({
  mounted,
  contentRef,
  ruleRefs,
  countRefs,
}: {
  mounted: boolean;
  contentRef: React.RefObject<HTMLDivElement | null>;
  ruleRefs: React.RefObject<(HTMLSpanElement | null)[]>;
  countRefs: React.RefObject<(HTMLSpanElement | null)[]>;
}) {
  return (
    <>
      <div
        ref={contentRef}
        className="absolute inset-0 mx-auto grid max-w-[1400px] grid-rows-[auto_auto_auto] content-between gap-5 px-5 pt-21 pb-13 min-[900px]:gap-6 min-[900px]:px-8 min-[900px]:pt-22 min-[900px]:pb-15"
      >
        <div className="flex items-start justify-between gap-8">
          <p
            data-hero-eyebrow
            className="font-mono text-[11px] tracking-[0.18em] text-white/62 uppercase"
          >
            PT Dutabahari Menara Line · 64 kapal · Banjarmasin · Sejak 1988
          </p>
          {/* Logo sertifikasi butuh ~58px agar segel ISO dan gerigi HSSE
              terbaca. Di layar sempit atau pendek barisnya disembunyikan,
              bukan dikecilkan sampai jadi bercak. */}
          <div
            data-hero-certs
            className="hidden items-center gap-4 min-[900px]:flex [@media(max-height:759px)]:hidden"
          >
            <span className="font-mono text-[11px] tracking-[0.16em] whitespace-nowrap text-white/70 uppercase">
              Tersertifikasi
            </span>
            {mounted
              ? CERT_BADGES.map((badge) => (
                  <Image
                    key={badge.assetPath}
                    src={badge.assetPath}
                    alt={badge.alt}
                    width={87}
                    height={58}
                    className="block h-14.5 w-auto"
                  />
                ))
              : null}
          </div>
        </div>

        <div className="flex flex-col items-start gap-5 text-left min-[900px]:items-center min-[900px]:text-center">
          <h1
            data-hero-h1
            className="font-display max-w-[22ch] text-[clamp(2.25rem,4.8vw,4.5rem)] leading-none tracking-[-0.02em] text-pretty text-white"
          >
            Mitra Andal Distribusi Energi dan Penyeberangan Laut
          </h1>
          <p
            data-hero-sub
            data-testid="hero-subteks"
            className="max-w-[52ch] text-lg leading-relaxed text-white/78"
          >
            Satu operator, dua lintasan. Dioperasikan dari Banjarmasin sejak 1988.
          </p>
        </div>

        <div className="grid grid-cols-1 items-end gap-5.5 min-[900px]:grid-cols-2 min-[900px]:gap-12">
          {DOORS.map((door, index) => {
            const isRoro = index === 1;
            const rule = (
              <span
                ref={(el) => {
                  ruleRefs.current[index] = el;
                }}
                aria-hidden="true"
                className="h-0.5 w-5.5 bg-accent-lift"
              />
            );
            return (
              <div
                key={door.key}
                data-hero-door
                className={`flex flex-col gap-4 ${
                  isRoro ? "min-[900px]:items-end min-[900px]:text-right" : ""
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isRoro ? null : rule}
                  <span className="font-mono text-[11px] tracking-[0.2em] whitespace-nowrap text-white uppercase">
                    {door.label}
                  </span>
                  {isRoro ? rule : null}
                </div>

                <div className="flex items-baseline gap-2.5">
                  <span
                    ref={(el) => {
                      countRefs.current[index] = el;
                    }}
                    className="font-display text-[clamp(2.125rem,3.4vw,3.125rem)] leading-none text-white"
                  >
                    {door.value}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.16em] text-white/62 uppercase">
                    {door.unit}
                  </span>
                </div>

                <p className="hidden max-w-[34ch] text-base leading-relaxed text-white/80 min-[900px]:block">
                  {door.desc}
                </p>

                <div>
                  <span data-hero-cta className="inline-flex">
                    {isRoro ? (
                      <CtaLink href="https://dutabahari.id" variant="ghost">
                        Pesan Tiket Ro-Ro
                      </CtaLink>
                    ) : (
                      <CtaLink href={CTA_BBM_HREF}>Permintaan Informasi BBM</CtaLink>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        data-hero-scroll
        className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2.5"
      >
        <span className="block h-px w-7 overflow-hidden bg-white/16">
          <span className="animate-hero-scroll block h-px w-7 bg-white" />
        </span>
        <span className="font-mono text-[10px] tracking-[0.24em] text-white/56 uppercase">
          Gulir
        </span>
      </div>
    </>
  );
}
