import type { FleetClass } from "@/content/types";

/**
 * Path haluan-buritan sederhana, ditulis tangan per kelas berdasarkan
 * proporsi panjang:lebar dari FleetClass, bukan diturunkan dari
 * hull-geometry.ts (itu geometri 3D, ini SVG 2D independen untuk mobile,
 * sesuai spec bagian 7.4: tiga representasi yang masing-masing pekerjaan
 * nyata, bukan satu representasi yang diproyeksikan ke dua tempat).
 */
function hullPath(fleetClass: FleetClass): string {
  const length = 200;
  const halfBeam = (fleetClass.beamMeters / fleetClass.lengthMeters) * length * 0.5;
  return `M 0 0 L ${length * 0.08} ${halfBeam * 0.6} L ${length * 0.2} ${halfBeam} L ${length * 0.85} ${halfBeam} L ${length} ${halfBeam * 0.3} L ${length * 0.85} ${-halfBeam} L ${length * 0.2} ${-halfBeam} L ${length * 0.08} ${-halfBeam * 0.6} Z`;
}

export function BlueprintSvg({ fleetClasses }: { fleetClasses: FleetClass[] }) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {fleetClasses.map((fleetClass) => (
        <figure key={fleetClass.slug} className="rounded-card border border-surface-3 bg-surface-2 p-6">
          <svg viewBox="-20 -60 240 120" className="h-auto w-full" role="img" aria-labelledby={`blueprint-${fleetClass.slug}`}>
            <title id={`blueprint-${fleetClass.slug}`}>{fleetClass.altText}</title>
            <path d={hullPath(fleetClass)} fill="none" stroke="#C62828" strokeWidth={1.5} />
          </svg>
          <figcaption className="mt-4 text-sm text-ink-muted">
            <span className="text-ink">{fleetClass.name}</span>, {fleetClass.lengthMeters} m, {fleetClass.capacityLabel}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
