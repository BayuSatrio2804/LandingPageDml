/**
 * Palet "Deep Water". Sumber kebenaran tunggal untuk warna.
 * Nilai di sini wajib identik dengan blok @theme di globals.css.
 * Rasio kontrasnya dijaga oleh tokens.test.ts.
 */
export const TOKENS = {
  surface: "#0A1418",
  surface2: "#111E24",
  surface3: "#18292F",
  ink: "#F2EFE9",
  inkMuted: "#8FA1A8",
  accent: "#FF5A1F",
  accentHover: "#FF7A45",
  accentPress: "#E04A12",
  onAccent: "#0A1418",
} as const;

export type TokenName = keyof typeof TOKENS;
