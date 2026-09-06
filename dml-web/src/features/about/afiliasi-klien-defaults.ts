/**
 * Teks bawaan dua blok "afiliasi" dan "klien" yang dirender di halaman
 * /tentang-kami (AfiliasiCards, KlienMarquee) lewat global Payload
 * `afiliasi-klien`. Angka armada, daftar afiliasi, dan logo klien tetap dari
 * koleksi CMS; di sini cuma judul, kicker, dan prosa.
 *
 * Riwayat: dulu berkas ini ("bisnis-defaults.ts") juga menyimpan
 * hero/liniUtama/alurSts/cta/sectionIndexLabels untuk halaman hub /bisnis,
 * dan hidup di src/features/bisnis/. Halaman hub itu sudah dihapus (lihat
 * next.config.ts untuk redirect /bisnis -> /tentang-kami) karena sudah
 * tidak ditautkan dari navigasi mana pun, dan berkas ini dipindah + diganti
 * nama ke sini karena isinya sekarang murni konten Tentang Kami, bukan
 * Bisnis. `src/features/bisnis/` sekarang cuma menyisakan
 * `subpages-defaults.ts` untuk dua sub-halaman /bisnis/* yang masih hidup.
 */
export type AfiliasiKlienData = {
  afiliasi: { kicker: string; heading: string; subtext: string };
  klien: {
    kicker: string;
    heading: string;
    stat1Unit: string;
    stat1Caption: string;
    stat2Value: string;
    stat2Unit: string;
    stat2Caption: string;
    placeholderNote: string;
  };
};

export const AFILIASI_KLIEN_DEFAULTS: AfiliasiKlienData = {
  afiliasi: {
    kicker: "Sinar Alam Corporation",
    heading: "Perusahaan afiliasi",
    subtext: "Tiga perusahaan yang berdiri sendiri di dalam grup, tidak dijalankan DML.",
  },
  klien: {
    kicker: "Klien korporat",
    heading: "Dipercaya oleh perusahaan terkemuka",
    stat1Unit: "klien",
    stat1Caption: "Energi, tambang, dan pelayaran",
    stat2Value: "37",
    stat2Unit: "tahun",
    stat2Caption: "Mengangkut sejak 1988",
    placeholderNote:
      "AKR Corporindo masih placeholder tipografi — belum ada berkas logo resminya.",
  },
};
