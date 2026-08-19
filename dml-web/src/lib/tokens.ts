/**
 * Palet "Maritim Terang", selaras dengan identitas visual pthis.id
 * pada varian light theme. Nilai di sini wajib identik dengan blok
 * @theme di globals.css. Rasio kontrasnya dijaga oleh tokens.test.ts.
 */
export const TOKENS = {
  surface: "#FFFFFF",
  surface2: "#F5F7FA",
  surface3: "#E9EDF3",
  ink: "#181C24",
  inkMuted: "#5B6B82",
  accent: "#C62828",
  accentHover: "#E5453A",
  accentPress: "#A81F1F",
  onAccent: "#FFFFFF",
} as const;

export type TokenName = keyof typeof TOKENS;
