/**
 * Satu bahasa material untuk seluruh lambung, baik yang datang dari model GLB
 * maupun yang dibangun dari geometri. Nilai lambung diambil dari material
 * model tanker setelah dinormalisasi pipeline, bukan dipilih terpisah, supaya
 * lima kelas di comparator terbaca sebagai satu keluarga.
 */
export const HULL_MATERIAL = {
  color: "#2A3B42",
  metalness: 0.65,
  roughness: 0.45,
} as const;

export const DECK_MATERIAL = {
  color: "#1B2C33",
  metalness: 0.3,
  roughness: 0.8,
} as const;

export const ACCENT_LINE_COLOR = "#C62828";
