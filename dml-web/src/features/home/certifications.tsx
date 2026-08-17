"use client";

import { COMPANY } from "@/content/company";
import { useCounter } from "@/lib/motion/use-counter";
import { Reveal } from "@/components/motion/reveal";

function VesselCounter() {
  const { ref, value } = useCounter(COMPANY.fleetSummary.vessels);
  return (
    <p ref={ref as React.RefObject<HTMLParagraphElement>} className="font-mono text-5xl text-accent md:text-6xl">
      {value}
    </p>
  );
}

function DwtCounter() {
  const { ref, value } = useCounter(COMPANY.fleetSummary.totalDwt);
  return (
    <p ref={ref as React.RefObject<HTMLParagraphElement>} className="font-mono text-5xl text-accent md:text-6xl">
      {value.toLocaleString("id-ID")}
    </p>
  );
}

export function Certifications() {
  return (
    <section className="bg-surface-2 py-24">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <VesselCounter />
            <p className="mt-2 text-ink-muted">
              Kapal {/* unverified: MagicPort */}
            </p>
          </div>
          <div>
            <DwtCounter />
            <p className="mt-2 text-ink-muted">
              Total DWT {/* unverified: MagicPort */}
            </p>
          </div>
        </div>
        <Reveal className="mt-16 flex flex-wrap gap-4" stagger={0.08}>
          {COMPANY.certifications.map((cert) => (
            <span key={cert} className="rounded-full border border-surface-3 px-4 py-2 font-mono text-sm text-ink-muted">
              {cert}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
