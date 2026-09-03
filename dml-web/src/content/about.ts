import type { LegalDocument } from "./types";

/**
 * Isi halaman Tentang Kami yang bukan sekadar meneruskan data company.ts.
 *
 * PENTING: perusahaan belum memiliki rumusan visi-misi tertulis maupun daftar
 * pengurus di company profile resmi. Slot yang biasanya diisi visi-misi di sini
 * diisi dua hal yang MEMANG tercatat — lini kerja dan tonggak pendirian. Jangan
 * menambahkan visi-misi karangan ke berkas ini; kalau klien mengirim rumusan
 * resminya, tambahkan sebagai entri baru dengan `source: "cp-pdf"`.
 */
export type IdentityBlock = {
  id: string;
  title: string;
  lead?: string;
  items?: string[];
  note?: string;
};

export const IDENTITY_BLOCKS: IdentityBlock[] = [
  {
    id: "lini",
    title: "Lini Kerja",
    items: [
      "Mengangkut bahan bakar cair ke pelabuhan dan pulau-pulau utama Indonesia, dari muat di terminal sampai serah di titik yang tidak terjangkau jetty konvensional.",
      "Mengoperasikan penyeberangan penumpang dan kendaraan dengan jadwal tetap di lintasan yang menghubungkan Jawa, Bali, Lombok, dan Kalimantan Tengah.",
      "Melakukan transfer bahan bakar antar kapal di tengah perairan, tanpa menunggu antrean sandar pelabuhan.",
    ],
  },
  {
    id: "tonggak",
    title: "Tonggak",
    lead: "Didirikan Herman Chandra di Banjarmasin pada 30 November 1988, dan kini menjadi bagian dari Sinar Alam Corporation bersama sebelas perusahaan lain di enam sektor usaha.",
    note: "Company profile resmi hanya mencatat satu tanggal. Tahun akuisisi, penambahan armada, dan pembukaan cabang belum terdokumentasi, jadi belum dicantumkan.",
  },
];

/**
 * Empat statistik di StatStrip (tahun/kapal/orang/sektor) tidak lagi punya
 * salinan di sini sejak CMS Fase 3-4: seluruhnya dihitung/dibaca dari
 * `company-profile` lewat getCompanyProfile() (lihat src/features/about/
 * stat-strip.tsx), bukan literal statis. "37 Tahun" dulu hardcode di sini
 * padahal itu angka yang berubah tiap tahun — StatStrip sekarang
 * menghitungnya lewat yearsOperating() (src/lib/company/years-operating.ts)
 * dari `foundedIso`, jadi tidak pernah basi lagi.
 */

/**
 * Sembilan dokumen legal dikelompokkan menurut JENIS dokumennya, bukan urutan
 * kemunculannya di PDF: satu daftar rata sembilan baris sulit dipindai.
 */
export const LEGAL_GROUPS = [
  {
    id: "akta",
    label: "Akta perusahaan",
    documents: ["Akta Pendirian Perusahaan", "Akta Perubahan Terakhir"],
  },
  {
    id: "izin",
    label: "Izin usaha dan operasional",
    // "DOC (Dokumen Kepatuhan)" sebelumnya salah ketik di sini (nama
    // literalnya "DOC (Document of Compliance)"), jadi baris ini diam-diam
    // tidak pernah tampil — groupedLegalDocuments() membuang entri yang
    // tidak ketemu tanpa error. Diperbaiki sekalian saat dokumen legal
    // pindah ke CMS (Fase 4).
    documents: [
      "SIUPAL (Surat Izin Usaha Pengangkutan Laut)",
      "Sertifikat Izin Usaha Pengangkutan Kapal",
      "DOC (Document of Compliance)",
    ],
  },
  {
    id: "pendaftaran",
    label: "Pendaftaran dan pajak",
    documents: [
      "NIB (Nomor Induk Berusaha)",
      "TDP (Tanda Daftar Perusahaan)",
      "NPWP (Nomor Pokok Wajib Pajak)",
      "Surat Keterangan Domisili Perusahaan",
    ],
  },
] as const;

/**
 * `documents` datang dari CMS (getLegalDocuments(), koleksi Payload
 * `legal-documents`) sejak Fase 4 — parameter, bukan lagi import
 * module-scope, supaya berkas ini tidak butuh koneksi database sendiri.
 */
export function groupedLegalDocuments(documents: LegalDocument[]) {
  return LEGAL_GROUPS.map((group) => ({
    ...group,
    // Dicocokkan lewat nama dokumen, dan entri yang tidak ditemukan dibuang
    // ketimbang merender baris kosong: kalau admin mengubah field `document`
    // lewat /admin, yang hilang adalah barisnya, bukan seluruh halaman.
    docs: group.documents
      .map((name) => documents.find((doc) => doc.document === name))
      .filter((doc): doc is LegalDocument => Boolean(doc)),
  }));
}
