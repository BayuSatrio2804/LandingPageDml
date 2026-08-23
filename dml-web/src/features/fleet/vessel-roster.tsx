import type { FleetClass } from "@/content/types";
import { vesselsByClass } from "@/content/vessels";

/**
 * Daftar nama kapal per kelas, bukan tabel. Halaman lini BBM sudah memakai
 * FleetSpecTable untuk angka; dua tabel beruntun membuat halaman terbaca
 * seperti lampiran. Di sini yang dibaca adalah nama, dan nama paling enak
 * dibaca sebagai daftar berkolom.
 */
export function VesselRoster({ fleetClasses }: { fleetClasses: FleetClass[] }) {
  return (
    <div className="mt-10 grid gap-10 md:grid-cols-2">
      {fleetClasses.map((fleetClass) => {
        const vessels = vesselsByClass(fleetClass.slug);
        const headingId = `roster-${fleetClass.slug}`;
        return (
          <section key={fleetClass.slug} aria-labelledby={headingId}>
            <h3 id={headingId} className="font-display text-pretty text-xl font-bold text-ink">
              {fleetClass.name}
            </h3>
            <p className="mt-1 font-mono text-xs text-ink-muted">
              {vessels.length} kapal, {fleetClass.capacityLabel}
            </p>
            <ul
              aria-labelledby={headingId}
              className="mt-4 columns-1 gap-x-8 font-mono text-sm text-ink-muted sm:columns-2 md:columns-1 lg:columns-2"
            >
              {vessels.map((vessel) => (
                <li key={vessel.name} className="break-inside-avoid py-1">
                  {vessel.name}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
