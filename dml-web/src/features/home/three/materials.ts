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
 */
export const HULL_MATERIAL = {
  color: "#33475C",
  metalness: 0.5,
  roughness: 0.45,
} as const;

export const DECK_MATERIAL = {
  color: "#22303F",
  metalness: 0.3,
  roughness: 0.8,
} as const;

/** Diambil dari token, bukan disalin, supaya garis ukur tidak pernah menua sendiri. */
export const ACCENT_LINE_COLOR: string = TOKENS.accent;

/** Garis grid lantai panggung: sumbu utama dan sumbu pembagi. */
export const GRID_COLORS = {
  main: TOKENS.surface3,
  sub: "#E3EBF5",
} as const;
