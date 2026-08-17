"use client";

import { COMPANY } from "@/content/company";
import { PORTS } from "@/features/route-map/ports";
import { useCounter } from "@/lib/motion/use-counter";
import { yearsOperating } from "./since-1985";
import { Reveal } from "@/components/motion/reveal";

/**
 * Sertifikasi dikelompokkan karena ISO 9001 berlaku untuk galangan, bukan
 * untuk operasi kapal. Satu deret pill seragam menyamarkan perbedaan itu.
 */
const CERT_CLUSTERS = [
  { label: "Operasi kapal", certs: ["ISM Code", "ISPS Code", "SIRE"] },
  { label: "Galangan", certs: ["ISO 9001:2015"] },
] as const;

function Metric({ value, label, format }: { value: number; label: string; format?: "id" }) {
  const { ref, value: current } = useCounter(value);
  const shown = format === "id" ? current.toLocaleString("id-ID") : String(current);
  return (
    <div data-testid="metrik" className="px-6 py-8 first:pl-0 md:border-l md:border-surface-3">
      <p
        ref={ref as React.RefObject<HTMLParagraphElement>}
        className="font-mono text-4xl text-accent md:text-5xl"
      >
        {shown}
      </p>
      <p className="mt-2 text-sm text-ink-muted">{label}</p>
    </div>
  );
}

export function Certifications() {
  const years = yearsOperating(COMPANY.foundedIso, new Date());
  // Kantor pusat ikut hidup di PORTS supaya bisa digambar di peta, tapi ia
  // bukan pelabuhan yang dilayani. Tanpa saringan ini metriknya mengklaim
  // lima pelabuhan padahal cuma empat.
  const servedPorts = PORTS.filter((port) => port.kind === "pelabuhan").length;

  return (
    <section className="bg-surface-2 py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="grid grid-cols-2 border-y border-surface-3 md:grid-cols-4">
          <Metric value={COMPANY.fleetSummary.vessels} label="Kapal" />
          <Metric value={COMPANY.fleetSummary.totalDwt} label="Total DWT" format="id" />
          <Metric value={years} label="Tahun beroperasi" />
          <Metric value={servedPorts} label="Pelabuhan dilayani" />
        </div>

        <Reveal className="mt-16 grid gap-10 md:grid-cols-2" stagger={0.08}>
          {CERT_CLUSTERS.map((cluster) => (
            <div key={cluster.label}>
              <p className="font-mono text-xs text-ink-muted">{cluster.label}</p>
              <ul className="mt-4 flex flex-wrap gap-3">
                {cluster.certs.map((cert) => (
                  <li
                    key={cert}
                    className="rounded-full border border-surface-3 px-4 py-2 font-mono text-sm text-ink"
                  >
                    {cert}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
