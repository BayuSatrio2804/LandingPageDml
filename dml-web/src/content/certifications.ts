import type { SourceTag } from "./types";

export type CertBadge = {
  /** Wajib sama persis dengan entri di COMPANY.standards kalau source-nya cp-pdf. */
  name: string;
  /** Path relatif terhadap public/. Dijaga certifications.test.ts agar benar-benar ada. */
  assetPath: string;
  alt: string;
  source: SourceTag;
};

/**
 * Lencana sertifikasi yang tampil di hero. Sebelum Plan 6 daftar ini berupa
 * array literal di dalam hero.tsx, terpisah dari COMPANY.standards, dan salah
 * satu isinya (HSSE) tidak punya dasar di dokumen mana pun.
 *
 * HSSE dipertahankan tapi ditandai belum-terverifikasi, bukan dihapus.
 * Menghapusnya diam-diam membuang klaim yang mungkin benar untuk operator
 * tanker; menandainya membuat klien bisa mencoretnya tanpa menebak, mengikuti
 * konvensi `source` yang sudah dipakai COMPANY.standards.
 *
 * Berkas PNG di assetPath saat ini adalah placeholder yang dibangkitkan
 * scripts/prepare-cert-placeholders.ts. Prosedur menukarnya dengan logo resmi
 * klien ada di README.
 */
export const CERT_BADGES: CertBadge[] = [
  {
    name: "ISO 9001:2015",
    assetPath: "/assets/cert/iso-9001.png",
    alt: "Tersertifikasi ISO 9001:2015",
    source: "cp-pdf",
  },
  {
    name: "ISM Code",
    assetPath: "/assets/cert/ism-code.png",
    alt: "Menerapkan ISM Code",
    source: "cp-pdf",
  },
  {
    name: "HSSE",
    assetPath: "/assets/cert/hsse.png",
    alt: "Utamakan keselamatan dan kesehatan kerja",
    source: "belum-terverifikasi",
  },
];
