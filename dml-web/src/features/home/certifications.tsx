"use client";

import { COMPANY } from "@/content/company";
import { DML_SERVED_PORT_IDS } from "@/features/route-map/ports";
import { useCounter } from "@/lib/motion/use-counter";
import { yearsOperating } from "@/lib/company/years-operating";
import { Reveal } from "@/components/motion/reveal";

function Metric({
  value,
  label,
  prefix,
  format,
}: {
  value: number;
  label: string;
  prefix?: string;
  format?: "id";
}) {
  const { ref, value: current } = useCounter(value);
  const shown = format === "id" ? current.toLocaleString("id-ID") : String(current);
  return (
    <div data-testid="metrik" className="px-6 py-8 first:pl-0 md:border-l md:border-surface-3">
      <p
        ref={ref as React.RefObject<HTMLParagraphElement>}
        className="font-mono text-4xl text-accent md:text-5xl"
      >
        {prefix}
        {shown}
      </p>
      <p className="mt-2 text-sm text-ink-muted">{label}</p>
    </div>
  );
}

/**
 * Klaster standar diambil dari COMPANY.standards, bukan dari daftar datar.
 * Halaman 01 company profile menaruh empat lambang berdampingan yang bukan
 * kategori yang sama: sertifikat mutu DQS, sistem keselamatan ISM, biro
 * klasifikasi BKI, dan SAP yang sama sekali bukan sertifikat melainkan ERP.
 * Satu deret pill seragam akan menyamarkan perbedaan itu dan membuat SAP
 * terbaca seolah lembaga sertifikasi keselamatan.
 *
 * Butir bertanda riset-publik (ISPS Code, SIRE) tidak muncul di PDF. Keduanya
 * tetap ditampilkan karena berasal dari riset Plan 1 yang tercatat di master
 * spec, tapi ditandai supaya klien bisa mencoretnya tanpa menebak.
 */
export function Certifications() {
  const years = yearsOperating(COMPANY.foundedIso, new Date());

  return (
    <section className="bg-surface-2 py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="grid grid-cols-2 border-y border-surface-3 md:grid-cols-4">
          <Metric value={COMPANY.fleetSummary.vessels} label="Kapal" />
          <Metric value={COMPANY.fleetSummary.people} label="Orang" prefix="&gt;" />
          <Metric value={years} label="Tahun beroperasi" />
          <Metric value={DML_SERVED_PORT_IDS.length} label="Pelabuhan dilayani" />
        </div>

        <Reveal className="mt-16 grid gap-10 md:grid-cols-3" stagger={0.08}>
          {COMPANY.standards.map((cluster) => (
            <div key={cluster.label} data-testid="klaster-standar">
              <p className="font-mono text-xs text-ink-muted">{cluster.label}</p>
              <ul className="mt-4 flex flex-wrap gap-3">
                {cluster.items.map((item) => (
                  <li
                    key={item.name}
                    className="rounded-full border border-surface-3 px-4 py-2 font-mono text-sm text-ink"
                    title={
                      item.source === "cp-pdf"
                        ? undefined
                        : "Belum tercantum di company profile resmi, menunggu konfirmasi klien"
                    }
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>

        <div className="mt-14 border-t border-surface-3 pt-8">
          <p className="font-mono text-xs text-ink-muted">Keanggotaan</p>
          <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
            {COMPANY.memberships.map((membership) => (
              <li key={membership.name} data-testid="keanggotaan" className="text-sm text-ink">
                {membership.name}
                {membership.expansion ? (
                  <span className="ml-2 text-xs text-ink-muted">{membership.expansion}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
