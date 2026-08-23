import { TOKENS } from "@/lib/tokens";

/**
 * Satu bahasa material untuk seluruh lambung, baik yang datang dari model GLB
 * maupun yang dibangun dari geometri. Nilai lambung diambil dari material
 * model tanker setelah dinormalisasi pipeline, bukan dipilih terpisah, supaya
 * lima kelas di comparator terbaca sebagai satu keluarga.
 *
 * Warnanya digeser ke keluarga navy saat halaman pindah ke palet terang. Yang
 * berubah bukan cuma rona: metalness turun dari 0,65 ke 0,5 karena lingkungan
 * sekarang terang. Logam memantulkan sekitarnya, jadi angka lama yang dulu
 * dipilih untuk menahan lambung tetap terbaca di atas bidang hitam justru
 * membuat lambung berkilau nyaris putih di atas bidang terang.
 *
 * Plan 7 menurunkan lambung dan dek satu tingkat lagi mengikuti bidang halaman
 * yang ikut turun, dan memindahkan grid sub dari #E3EBF5 ke #D9E2EF karena
 * nilai lama lebih terang daripada bidang yang sekarang menampungnya, jadi
 * garis pembagi terbaca sebagai sorot, bukan sebagai grid.
 */
export const HULL_MATERIAL = {
  color: "#2C3E52",
  metalness: 0.5,
  roughness: 0.45,
} as const;

export const DECK_MATERIAL = {
  color: "#1C2836",
  metalness: 0.3,
  roughness: 0.8,
} as const;

/** Diambil dari token, bukan disalin, supaya garis ukur tidak pernah menua sendiri. */
export const ACCENT_LINE_COLOR: string = TOKENS.accent;

/** Garis grid lantai panggung: sumbu utama dan sumbu pembagi. */
export const GRID_COLORS = {
  main: TOKENS.surface3,
  sub: "#D9E2EF",
} as const;
