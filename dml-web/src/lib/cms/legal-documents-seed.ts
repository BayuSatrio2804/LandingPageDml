/**
 * Nilai default koleksi Payload `legal-documents`, dipakai scripts/seed.ts.
 * Satu-satunya sumber literal sejak tabel dokumen legal pindah ke CMS —
 * src/content/legal-documents.ts sudah dihapus.
 *
 * Sembilan dokumen dari company profile resmi `assets/CP DML.pdf` halaman
 * 06, disalin apa adanya dengan kapitalisasi dinormalkan.
 *
 * "Badan Kordinasi Penanaman Modal" ditulis begitu di PDF, tanpa huruf O
 * kedua. Ejaan resminya "Koordinasi", tapi nilai di sini mengikuti dokumen
 * sumber, sesuai aturan repo bahwa data korporat disalin bukan dikoreksi.
 * Kalau klien mengonfirmasi ini salah ketik di company profile mereka,
 * perbaiki di sini dan catat di README.
 *
 * `order` mengikuti urutan tampil di src/content/about.ts (`LEGAL_GROUPS`),
 * dikelompokkan per JENIS dokumen: akta, izin usaha dan operasional,
 * pendaftaran dan pajak.
 */
export const LEGAL_DOCUMENTS_SEED = [
  {
    document: "Akta Pendirian Perusahaan",
    number: "No. 3887",
    issuer: "Notaris Nyonya Bertha Suriati",
    source: "cp-pdf" as const,
    order: 0,
  },
  {
    document: "Akta Perubahan Terakhir",
    number: "No. 151",
    issuer: "Notaris Linda Kenari, S.H., M.H.",
    source: "cp-pdf" as const,
    order: 1,
  },
  {
    document: "SIUPAL (Surat Izin Usaha Pengangkutan Laut)",
    number: "BX-333/AL/001",
    issuer: "Kementerian Perhubungan, Direktorat Jenderal Perhubungan Laut",
    source: "cp-pdf" as const,
    order: 2,
  },
  {
    document: "Sertifikat Izin Usaha Pengangkutan Kapal",
    number: "05.AL03.21.00.014",
    issuer: "Badan Kordinasi Penanaman Modal",
    source: "cp-pdf" as const,
    order: 3,
  },
  {
    document: "DOC (Document of Compliance)",
    number: "AL 601/537/13/DK/2019",
    issuer: "Direktorat Jenderal Perhubungan Laut",
    source: "cp-pdf" as const,
    order: 4,
  },
  {
    document: "NIB (Nomor Induk Berusaha)",
    number: "9120001262268",
    issuer: "Sistem OSS",
    source: "cp-pdf" as const,
    order: 5,
  },
  {
    document: "TDP (Tanda Daftar Perusahaan)",
    number: "16.10.1.50.0784",
    issuer:
      "Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu Pemerintah Kota Banjarmasin",
    source: "cp-pdf" as const,
    order: 6,
  },
  {
    document: "NPWP (Nomor Pokok Wajib Pajak)",
    number: "01.474.162.2-731.000",
    issuer: "Direktorat Jenderal Pajak",
    source: "cp-pdf" as const,
    order: 7,
  },
  {
    document: "Surat Keterangan Domisili Perusahaan",
    number: "503.5183_XII",
    issuer:
      "Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu Pemerintah Kota Banjarmasin",
    source: "cp-pdf" as const,
    order: 8,
  },
];
