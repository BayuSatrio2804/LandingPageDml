import type { LegalDocument } from "./types";

/**
 * Tabel dokumen legal dari company profile resmi `assets/CP DML.pdf`
 * halaman 06, disalin apa adanya dengan kapitalisasi dinormalkan.
 *
 * "Badan Kordinasi Penanaman Modal" ditulis begitu di PDF, tanpa huruf O
 * kedua. Ejaan resminya "Koordinasi", tapi nilai di sini mengikuti dokumen
 * sumber, sesuai aturan repo bahwa data korporat disalin bukan dikoreksi.
 * Kalau klien mengonfirmasi ini salah ketik di company profile mereka,
 * perbaiki di sini dan catat di README.
 */
export const LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    document: "Akta Pendirian Perusahaan",
    number: "No. 3887",
    issuer: "Notaris Nyonya Bertha Suriati",
    source: "cp-pdf",
  },
  {
    document: "Akta Perubahan Terakhir",
    number: "No. 151",
    issuer: "Notaris Linda Kenari, S.H., M.H.",
    source: "cp-pdf",
  },
  {
    document: "DOC (Document of Compliance)",
    number: "AL 601/537/13/DK/2019",
    issuer: "Direktorat Jenderal Perhubungan Laut",
    source: "cp-pdf",
  },
  {
    document: "NIB (Nomor Induk Berusaha)",
    number: "9120001262268",
    issuer: "Sistem OSS",
    source: "cp-pdf",
  },
  {
    document: "SIUPAL (Surat Izin Usaha Pengangkutan Laut)",
    number: "BX-333/AL/001",
    issuer: "Kementerian Perhubungan, Direktorat Jenderal Perhubungan Laut",
    source: "cp-pdf",
  },
  {
    document: "TDP (Tanda Daftar Perusahaan)",
    number: "16.10.1.50.0784",
    issuer:
      "Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu Pemerintah Kota Banjarmasin",
    source: "cp-pdf",
  },
  {
    document: "Surat Keterangan Domisili Perusahaan",
    number: "503.5183_XII",
    issuer:
      "Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu Pemerintah Kota Banjarmasin",
    source: "cp-pdf",
  },
  {
    document: "NPWP (Nomor Pokok Wajib Pajak)",
    number: "01.474.162.2-731.000",
    issuer: "Direktorat Jenderal Pajak",
    source: "cp-pdf",
  },
  {
    document: "Sertifikat Izin Usaha Pengangkutan Kapal",
    number: "05.AL03.21.00.014",
    issuer: "Badan Kordinasi Penanaman Modal",
    source: "cp-pdf",
  },
];
