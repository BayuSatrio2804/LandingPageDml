import { LEGAL_DOCUMENTS } from "@/content/legal-documents";

/**
 * Dua penyajian dari satu data, bukan satu tabel yang menggulir.
 *
 * Kolom penerbit di sini panjang, salah satunya 78 karakter, sehingga tabel
 * tiga kolom di 375 px hanya bisa dibaca dengan menggulir mendatar. Tabel
 * gulir mendatar di mobile sudah jadi temuan aksesibilitas di Plan 6, jadi di
 * bawah md data yang sama disajikan sebagai daftar definisi bertingkat.
 * Ini beda perlakuan dari FleetSpecTable dan RouteTable, yang kolomnya pendek
 * dan berisi angka sehingga masih masuk akal digulir.
 */
export function LegalTable() {
  return (
    <div className="mt-8">
      <table className="hidden w-full border-collapse text-left text-sm md:table">
        <caption className="sr-only">
          Dokumen legal PT Dutabahari Menara Line beserta nomor dan penerbitnya
        </caption>
        <thead>
          <tr className="border-b border-surface-3 text-ink-muted">
            <th scope="col" className="py-3 pr-4 font-normal">Dokumen</th>
            <th scope="col" className="py-3 pr-4 font-normal">Nomor</th>
            <th scope="col" className="py-3 font-normal">Diterbitkan oleh</th>
          </tr>
        </thead>
        <tbody>
          {LEGAL_DOCUMENTS.map((entry) => (
            <tr key={entry.number} className="border-b border-surface-3/50 align-top text-ink">
              <td className="py-3 pr-4">{entry.document}</td>
              <td className="py-3 pr-4 font-mono text-xs">{entry.number}</td>
              <td className="py-3 text-xs text-ink-muted">{entry.issuer}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="space-y-6 md:hidden">
        {LEGAL_DOCUMENTS.map((entry) => (
          <div key={entry.number} className="border-b border-surface-3/50 pb-4">
            <dt className="font-display font-bold text-ink">{entry.document}</dt>
            <dd className="mt-1 font-mono text-xs text-ink">{entry.number}</dd>
            <dd className="mt-1 text-xs text-ink-muted">{entry.issuer}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 font-mono text-xs text-ink-muted">
        Sumber: company profile PT Dutabahari Menara Line halaman 06.
      </p>
    </div>
  );
}
