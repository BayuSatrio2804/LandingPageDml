/**
 * Nilai bawaan teks hero Beranda.
 *
 * Dipakai dua tempat: (1) sebagai fallback kalau global `home-hero` belum
 * pernah disimpan (build tanpa seed, atau sebelum migrasi jalan), dan (2)
 * sebagai default prop komponen supaya hero.test.tsx tetap bisa merender
 * <Hero /> tanpa menyuntik data CMS.
 *
 * Sumber angka & kata sama persis dengan versi hardcode sebelumnya di
 * hero-copy.tsx dan hero-doors.tsx.
 */
export type HomeHeroDoor = {
  label: string;
  value: number;
  unit: string;
  description: string;
  ctaLabel: string;
};

export type HomeHeroData = {
  eyebrow: string;
  headline: string;
  subheadline: string;
  scrollLabel: string;
  bbm: HomeHeroDoor;
  roro: HomeHeroDoor & { ctaHref: string };
};

export const HOME_HERO_DEFAULTS: HomeHeroData = {
  eyebrow: "PT Dutabahari Menara Line · 64 kapal · Banjarmasin · Sejak 1988",
  headline: "Mitra Andal Distribusi Energi dan Penyeberangan Laut",
  subheadline: "Satu operator, dua lintasan. Dioperasikan dari Banjarmasin sejak 1988.",
  scrollLabel: "Gulir",
  bbm: {
    label: "Transportasi BBM",
    value: 55,
    unit: "Tanker",
    description:
      "Pengangkutan bahan bakar dan transfer ship-to-ship untuk klien korporat.",
    ctaLabel: "Permintaan Informasi BBM",
  },
  roro: {
    label: "Penyeberangan Ro-Ro",
    value: 9,
    unit: "Kapal",
    description: "Penyeberangan untuk penumpang dan kendaraan, dengan tiket daring.",
    ctaLabel: "Pesan Tiket Ro-Ro",
    ctaHref: "https://dutabahari.id",
  },
};
