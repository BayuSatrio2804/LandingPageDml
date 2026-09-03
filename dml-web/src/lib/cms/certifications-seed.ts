/**
 * Nilai default koleksi Payload `certifications`, dipakai scripts/seed.ts.
 * Satu-satunya sumber literal sejak lencana sertifikasi pindah ke CMS —
 * src/content/certifications.ts sudah dihapus.
 *
 * HSSE ditandai belum-terverifikasi, bukan dihapus: klaimnya mungkin benar
 * untuk operator tanker tapi tidak muncul di company profile PDF manapun.
 * `name` wajib sama persis dengan entri di company-profile.standards kalau
 * source-nya cp-pdf.
 */
export const CERTIFICATIONS_SEED = [
  {
    name: "ISO 9001:2015",
    badgeFile: "iso-9001.png",
    alt: "Tersertifikasi ISO 9001:2015",
    source: "cp-pdf" as const,
    order: 0,
  },
  {
    name: "ISM Code",
    badgeFile: "ism-code.png",
    alt: "Menerapkan ISM Code",
    source: "cp-pdf" as const,
    order: 1,
  },
  {
    name: "HSSE",
    badgeFile: "hsse.png",
    alt: "Utamakan keselamatan dan kesehatan kerja",
    source: "belum-terverifikasi" as const,
    order: 2,
  },
];
