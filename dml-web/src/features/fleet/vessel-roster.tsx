import type { FleetClass, Vessel } from "@/content/types";

/**
 * Daftar nama kapal per kelas, bukan tabel. Halaman lini BBM sudah memakai
 * FleetSpecTable untuk angka; dua tabel beruntun membuat halaman terbaca
 * seperti lampiran. Di sini yang dibaca adalah nama, dan nama paling enak
 * dibaca sebagai daftar berkolom.
 *
 * `vessels` diterima sebagai prop (hasil query CMS koleksi `vessels`),
 * bukan `vesselsByClass` dari src/content/vessels.ts (sudah dihapus) —
 * jumlah "N kapal" di bawah otomatis mengikuti isi CMS, tidak pernah basi
 * meski admin menambah/menghapus kapal.
 */
export function VesselRoster({
  fleetClasses,
  vessels,
}: {
  fleetClasses: FleetClass[];
  vessels: Vessel[];
}) {
  return (
    <div className="mt-10 grid gap-10 md:grid-cols-2">
      {fleetClasses.map((fleetClass) => {
        const classVessels = vessels.filter((vessel) => vessel.classSlug === fleetClass.slug);
        const headingId = `roster-${fleetClass.slug}`;
        return (
          <section key={fleetClass.slug} aria-labelledby={headingId}>
            <h3 id={headingId} className="font-display text-pretty text-xl font-bold text-ink">
              {fleetClass.name}
            </h3>
            <p className="mt-1 font-mono text-xs text-ink-muted">
              {classVessels.length} kapal, {fleetClass.capacityLabel}
            </p>
            <ul
              aria-labelledby={headingId}
              className="mt-4 columns-1 gap-x-8 font-mono text-sm text-ink-muted sm:columns-2 md:columns-1 lg:columns-2"
            >
              {classVessels.map((vessel) => (
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
