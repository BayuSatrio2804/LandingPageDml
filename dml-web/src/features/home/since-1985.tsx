"use client";

import Link from "next/link";
import Image from "next/image";
import { COMPANY } from "@/content/company";
import { MEDIA, avifSrc } from "@/lib/media/manifest";
import { SectionHeader } from "@/components/ui/section-header";
import { useCounter } from "@/lib/motion/use-counter";

/**
 * Menghitung tahun penuh, bukan selisih tahun kalender: perusahaan berdiri 30
 * November, jadi sepanjang Januari sampai November angkanya masih tahun
 * sebelumnya. Selisih getFullYear saja akan menaikkannya sepuluh bulan lebih
 * awal.
 */
export function yearsOperating(foundedIso: string, now: Date): number {
  const founded = new Date(foundedIso);
  let years = now.getUTCFullYear() - founded.getUTCFullYear();
  const monthDelta = now.getUTCMonth() - founded.getUTCMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getUTCDate() < founded.getUTCDate())) {
    years -= 1;
  }
  return years;
}

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

export function Since1985() {
  const years = yearsOperating(COMPANY.foundedIso, new Date());
  const frame = MEDIA["lini-bisnis"].find((asset) => asset.id === "transportasi-bbm");

  return (
    <section className="bg-surface py-24 md:py-32">
      <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-8 px-4 md:px-8">
        <div className="col-span-12 md:col-span-7">
          <SectionHeader title="Sejak 1985" />
          <div className="mt-12">
            <YearCounter target={years} />
            <p className="mt-4 max-w-[34ch] text-ink-muted">
              tahun mengangkut bahan bakar dan orang di perairan Kalimantan.
            </p>
          </div>
        </div>

        <div className="col-span-12 md:col-span-5">
          {frame ? (
            <div className="relative aspect-4/3 overflow-hidden rounded-card">
              <Image
                src={avifSrc(frame, 1600)}
                alt={frame.alt}
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}
          <p className="mt-6 max-w-[42ch] text-ink">
            {COMPANY.legalName} didirikan {COMPANY.founder} di Banjarmasin, dan kini bagian dari{" "}
            {COMPANY.parent}.
          </p>
          <Link
            href="/tentang-kami#silsilah"
            className="mt-6 inline-block text-sm font-medium text-accent hover:text-accent-hover"
          >
            Lihat silsilah lengkap
          </Link>
        </div>
      </div>
    </section>
  );
}
