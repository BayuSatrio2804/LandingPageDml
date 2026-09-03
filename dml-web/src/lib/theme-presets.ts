/**
 * Preset warna aksen. Admin memilih salah satu lewat global `appearance`;
 * halaman menyuntik override CSS custom property di (site)/layout.tsx.
 *
 * HANYA keluarga aksen yang berubah (accent / hover / press / lift). Bidang
 * halaman, teks, garis, dan bidang gelap TETAP "Navy Selat" — nilainya
 * diikat tokens.test.ts dan tokens-parity.test.ts, dan dipakai scene 3D
 * serta beberapa gradien inline yang tidak membaca CSS var.
 *
 * Tiap preset wajib lolos gerbang di theme-presets.test.ts:
 *   - teks putih di atas aksen/hover/press >= 4.5:1
 *   - aksen sebagai teks di atas bidang halaman >= 4.5:1
 *   - surface3 sebagai teks di atas aksen >= 4.5:1  (kaki & kepala halaman)
 *   - hover lebih gelap dari aksen, press lebih gelap dari hover
 *   - aksen terangkat >= 3:1 di atas bidang gelap hero
 */
export type ThemePreset = "navy" | "teal" | "forest" | "plum";

export type AccentRamp = {
  accent: string;
  accentHover: string;
  accentPress: string;
  accentLift: string;
};

export const THEME_PRESETS: Record<ThemePreset, AccentRamp> = {
  // Sama persis dengan src/lib/tokens.ts — preset "tanpa perubahan".
  navy: {
    accent: "#183163",
    accentHover: "#12274F",
    accentPress: "#0C1B39",
    accentLift: "#5B84C8",
  },
  teal: {
    accent: "#0C3D42",
    accentHover: "#093034",
    accentPress: "#062326",
    accentLift: "#3E96A0",
  },
  forest: {
    accent: "#143D28",
    accentHover: "#0F3020",
    accentPress: "#0A2216",
    accentLift: "#4E9E74",
  },
  plum: {
    accent: "#45182F",
    accentHover: "#371326",
    accentPress: "#290E1C",
    accentLift: "#A6608A",
  },
};

export const THEME_PRESET_LABELS: Record<ThemePreset, string> = {
  navy: "Navy Selat (bawaan)",
  teal: "Teal Laut",
  forest: "Hijau Hutan",
  plum: "Marun",
};

/** Blok CSS override untuk disuntik di <head>. Kosong untuk navy. */
export function themeStyleBlock(theme: ThemePreset): string {
  if (theme === "navy") return "";
  const p = THEME_PRESETS[theme] ?? THEME_PRESETS.navy;
  return (
    ":root{" +
    `--color-accent:${p.accent};` +
    `--color-accent-hover:${p.accentHover};` +
    `--color-accent-press:${p.accentPress};` +
    `--color-accent-lift:${p.accentLift};` +
    "}"
  );
}
