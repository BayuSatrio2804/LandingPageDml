import type { FleetClass } from "@/content/types";

export function FleetSpecTable({ fleetClasses }: { fleetClasses: FleetClass[] }) {
  /**
   * Pembungkus yang bisa digulir mendatar, dan tabel yang punya lebar minimum.
   *
   * Lima kolom teks mono tidak muat di 375 px, dan tanpa pembungkus ini tabelnya
   * mendorong lebar dokumen jadi 384 px: SELURUH halaman ikut bisa digeser ke
   * samping, bukan cuma tabelnya. Diverifikasi di checkpoint mobile Plan 5.
   */
  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full min-w-[34rem] border-collapse text-left font-mono text-sm">
      <caption className="sr-only">Spesifikasi lima kelas kapal armada PT Dutabahari Menara Line</caption>
      <thead>
        <tr className="border-b border-surface-3 text-ink-muted">
          <th scope="col" className="py-3 pr-4 font-normal">Kelas</th>
          <th scope="col" className="py-3 pr-4 font-normal">Panjang</th>
          <th scope="col" className="py-3 pr-4 font-normal">DWT</th>
          <th scope="col" className="py-3 pr-4 font-normal">Kapasitas</th>
          <th scope="col" className="py-3 font-normal">Penumpang</th>
        </tr>
      </thead>
      <tbody>
        {fleetClasses.map((fleetClass) => (
          <tr key={fleetClass.slug} className="border-b border-surface-3/50 text-ink">
            <td className="py-3 pr-4">{fleetClass.name}</td>
            <td className="py-3 pr-4">{fleetClass.lengthMeters} m</td>
            <td className="py-3 pr-4">{fleetClass.dwt ? `${fleetClass.dwt.toLocaleString("id-ID")} DWT` : "-"}</td>
            <td className="py-3 pr-4">{fleetClass.capacityLabel}</td>
            <td className="py-3">{fleetClass.passengerCapacity ? `${fleetClass.passengerCapacity} orang` : "-"}</td>
          </tr>
        ))}
      </tbody>
      </table>
    </div>
  );
}
