import { ROUTE_LEGS } from "@/features/route-map/ports";
import { COMPANY } from "@/content/company";
import { vesselsByRoute } from "@/content/vessels";

/**
 * Kolom operator adalah alasan komponen ini ada. Lima lintasan terbaca sebagai
 * lima lintasan DML kalau operatornya tidak ditulis, padahal Merak-Bakauheni
 * dijalankan PT Tri Sumaja Lines menurut company profile halaman 03.
 *
 * Pembungkus gulir mendatar + tabIndex + role region mengikuti pola
 * FleetSpecTable: tanpa itu, tabel mendorong lebar dokumen di 375 px dan
 * SELURUH halaman ikut bisa digeser ke samping, dan pengguna keyboard tidak
 * bisa menggulirnya sama sekali (temuan aksesibilitas Plan 6).
 */
const OPERATOR_LABEL: Record<string, string> = {
  dml: COMPANY.legalName,
  tsl: "PT Tri Sumaja Lines",
};

export function RouteTable() {
  return (
    <div
      className="mt-10 overflow-x-auto"
      tabIndex={0}
      role="region"
      aria-label="Tabel lintasan penyeberangan"
    >
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <caption className="sr-only">
          Lima lintasan penyeberangan ro-ro beserta kapal dan operatornya
        </caption>
        <thead>
          <tr className="border-b border-surface-3 text-ink-muted">
            <th scope="col" className="py-3 pr-4 font-normal">Lintasan</th>
            <th scope="col" className="py-3 pr-4 font-normal">Kapal</th>
            <th scope="col" className="py-3 font-normal">Operator</th>
          </tr>
        </thead>
        <tbody>
          {ROUTE_LEGS.map((leg) => (
            <tr key={leg.id} className="border-b border-surface-3/50 align-top text-ink">
              <td className="py-4 pr-4">
                <span className="font-display font-bold">{leg.label}</span>
                <span className="mt-1 block text-xs text-ink-muted">{leg.note}</span>
              </td>
              <td className="py-4 pr-4 font-mono text-xs text-ink-muted">
                {vesselsByRoute(leg.id).map((vessel) => (
                  <span key={vessel.name} className="block">
                    {vessel.name}
                  </span>
                ))}
              </td>
              <td className="py-4 text-xs text-ink-muted">{OPERATOR_LABEL[leg.operator]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
