/**
 * Teks bawaan dua blok "afiliasi" dan "klien" yang sekarang dirender di
 * halaman /tentang-kami (AfiliasiCards, KlienMarquee) lewat global Payload
 * `business-page`. Angka armada, daftar afiliasi, dan logo klien tetap dari
 * koleksi CMS; di sini cuma judul, kicker, dan prosa.
 *
 * Dulu berkas ini juga menyimpan hero/liniUtama/alurSts/cta/sectionIndexLabels
 * untuk halaman hub /bisnis — dihapus bersamaan dengan halaman itu sendiri
 * (lihat next.config.ts untuk redirect /bisnis -> /tentang-kami), karena
 * halaman itu sudah tidak ditautkan dari navigasi mana pun.
 */
export type BisnisPageData = {
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

export const BISNIS_PAGE_DEFAULTS: BisnisPageData = {
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
