"use client";

import Link from "next/link";
import Image from "next/image";
import { COMPANY } from "@/content/company";
import { MEDIA, avifSrc } from "@/lib/media/manifest";
import { SectionHeader } from "@/components/ui/section-header";
import { useCounter } from "@/lib/motion/use-counter";
import { yearsOperating } from "@/lib/company/years-operating";
import { Reveal } from "@/components/motion/reveal";

function YearCounter({ target }: { target: number }) {
  const { ref, value } = useCounter(target);
  return (
    <p
      ref={ref as React.RefObject<HTMLParagraphElement>}
      className="font-mono text-7xl leading-none text-accent md:text-9xl"
    >
      {value}
    </p>
  );
}

/**
 * Tahun berdirinya dikoreksi dari 1985 ke 1988 di Plan 5. Angka 1985 datang
 * dari halaman profil grup dan sempat jadi judul seksi ini, headline hero,
 * teks footer, dan metadata; company profile resmi menyebut 30 November 1988.
 *
 * Tiga nilai perusahaan ikut masuk ke sini, bukan ke seksi terpisah, karena
 * huruf awalnya mengeja DML. Menaruhnya di seksi asal-usul membuat kebetulan
 * itu terbaca sebagai bagian dari cerita, bukan sebagai daftar nilai generik
 * yang bisa ditempel di perusahaan mana pun.
 */
export function Since1988() {
  const years = yearsOperating(COMPANY.foundedIso, new Date());
  const frame = MEDIA["lini-bisnis"].find((asset) => asset.id === "operasi-sts");

  return (
    <section className="bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-6">
            <SectionHeader title="Sejak 1988" />
            <div className="mt-12">
              <YearCounter target={years} />
              <p className="mt-4 max-w-[34ch] text-ink-muted">
                tahun mengangkut bahan bakar dan orang di perairan Indonesia.
              </p>
            </div>
            <p className="mt-10 max-w-[42ch] text-ink">
              {COMPANY.legalName} didirikan {COMPANY.founder} di Banjarmasin pada 30 November 1988,
              dan kini bagian dari {COMPANY.parent}.
            </p>
            <Link
              href="/tentang-kami#silsilah"
              className="mt-6 inline-block text-sm font-medium text-accent hover:text-accent-hover"
            >
              Lihat silsilah lengkap
            </Link>
          </div>

          <div className="col-span-12 md:col-span-6">
            {frame ? (
              <div className="relative aspect-4/3 overflow-hidden rounded-card">
                <Image
                  src={avifSrc(frame, 1600)}
                  alt={frame.alt}
                  fill
                  sizes="(min-width: 768px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>
            ) : null}
          </div>
        </div>

        <Reveal className="mt-20 border-t border-surface-3" stagger={0.08}>
          {COMPANY.values.map((value) => (
            <div
              key={value.key}
              data-testid="nilai-perusahaan"
              className="grid grid-cols-12 items-baseline gap-4 border-b border-surface-3 py-8 md:gap-8"
            >
              <span
                aria-hidden
                className="col-span-2 font-display text-4xl font-bold leading-none text-accent md:col-span-1 md:text-6xl"
              >
                {value.key}
              </span>
              <p className="col-span-10 font-display text-xl font-bold text-ink md:col-span-3 md:text-2xl">
                {value.term}
              </p>
              <p className="col-span-12 max-w-[52ch] text-ink-muted md:col-span-8">
                {value.description}
              </p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
