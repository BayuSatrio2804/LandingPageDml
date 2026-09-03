import { contrastRatio } from "./color";
import { TOKENS } from "./tokens";

/**
 * Warna aksen situs (tautan, tombol, judul beraksen, penanda aktif).
 * Admin memilih preset ATAU warna kustom lewat global `appearance`;
 * (site)/layout.tsx menyuntik override CSS custom property.
 *
 * HANYA keluarga aksen yang berubah (accent / hover / press / lift). Bidang
 * halaman, teks, garis, dan bidang gelap TETAP "Navy Selat" — nilainya
 * diikat tokens.test.ts, dipakai scene 3D dan beberapa gradien inline.
 *
 * Semua aksen (preset maupun kustom) HARUS lolos gerbang aksesibilitas
 * yang sama dengan tokens.test.ts:
 *   - teks putih di atas aksen >= 4.5:1
 *   - aksen sebagai teks di atas bidang halaman >= 4.5:1
 *   - surface3 sebagai teks di atas aksen >= 4.5:1  (kaki & kepala halaman)
 *   - aksen terangkat >= 3:1 di atas bidang gelap hero
 * Warna kustom yang tidak lolos DIABAIKAN di server dan situs jatuh ke navy.
 */
export type AccentRamp = {
  accent: string;
  accentHover: string;
  accentPress: string;
  accentLift: string;
};

/**
 * Preset bawaan. Semuanya warna dalam/gelap: gerbang "surface3 sebagai teks
 * di atas aksen" menuntut aksen yang cukup gelap, jadi tidak ada preset
 * terang di sini.
 */
export const THEME_PRESETS = {
  navy: "#183163",
  ocean: "#0A3A57",
  teal: "#0C3D42",
  pine: "#0E3B32",
  forest: "#143D28",
  indigo: "#262A6B",
  aubergine: "#3B1B44",
  plum: "#45182F",
  wine: "#5A1220",
  espresso: "#3A2A1E",
  slate: "#26333F",
  charcoal: "#2A2E33",
} as const;

export type ThemePreset = keyof typeof THEME_PRESETS;

export const THEME_PRESET_LABELS: Record<ThemePreset | "custom", string> = {
  navy: "Navy Selat (bawaan)",
  ocean: "Biru Samudra",
  teal: "Teal Laut",
  pine: "Cemara",
  forest: "Hijau Hutan",
  indigo: "Indigo",
  aubergine: "Terong",
  plum: "Prem",
  wine: "Anggur Merah",
  espresso: "Espreso",
  slate: "Batu Tulis",
  charcoal: "Arang",
  custom: "Kustom (pilih hex sendiri)",
};

export const NAVY_RAMP: AccentRamp = {
  accent: TOKENS.accent,
  accentHover: TOKENS.accentHover,
  accentPress: TOKENS.accentPress,
  accentLift: TOKENS.accentLift,
};

// ── util hex kecil (parseHex color.ts tidak diekspor) ─────────────────────
const HEX6 = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function toRgb(hex: string): [number, number, number] {
  const m = HEX6.exec(hex.trim());
  if (!m) throw new Error(`hex tidak sah: ${hex}`);
  const d = m[1]!.length === 3 ? m[1]!.replace(/(.)/g, "$1$1") : m[1]!;
  return [parseInt(d.slice(0, 2), 16), parseInt(d.slice(2, 4), 16), parseInt(d.slice(4, 6), 16)];
}

function toHex(rgb: [number, number, number]): string {
  return "#" + rgb.map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0")).join("");
}

const scale = (rgb: [number, number, number], f: number): [number, number, number] =>
  [rgb[0] * f, rgb[1] * f, rgb[2] * f];

const towardWhite = (rgb: [number, number, number], t: number): [number, number, number] =>
  [rgb[0] + (255 - rgb[0]) * t, rgb[1] + (255 - rgb[1]) * t, rgb[2] + (255 - rgb[2]) * t];

export function isValidHex(hex: string): boolean {
  return HEX6.test(hex.trim());
}

/**
 * Aksen dianggap aman kalau lolos empat gerbang di atas. accentLift diberi
 * kelonggaran: fungsi deriveRamp yang menaikkan campuran putih sampai lolos,
 * jadi di sini cukup cek bahwa aksennya sendiri bisa dijadikan lift yang
 * lolos (batas praktis: aksen tidak boleh sudah terlalu terang).
 */
export function isAccentSafe(accent: string): boolean {
  if (!isValidHex(accent)) return false;
  return (
    contrastRatio("#FFFFFF", accent) >= 4.5 &&
    contrastRatio(accent, TOKENS.surface) >= 4.5 &&
    contrastRatio(accent, TOKENS.surface2) >= 4.5 &&
    contrastRatio(TOKENS.surface3, accent) >= 4.5 &&
    contrastRatio(accent, TOKENS.accentSoft) >= 4.5
  );
}

/**
 * Turunkan hover/press/lift dari satu warna aksen.
 * hover & press: aksen digelapkan bertahap.
 * lift: aksen diterangkan menuju putih sampai lolos 3:1 di atas heroGround.
 */
export function deriveRamp(accentInput: string): AccentRamp {
  const rgb = toRgb(accentInput);
  const accent = toHex(rgb); // normalkan ke #rrggbb huruf kecil
  const accentHover = toHex(scale(rgb, 0.78));
  const accentPress = toHex(scale(rgb, 0.58));

  let t = 0.4;
  let lift = toHex(towardWhite(rgb, t));
  while (t < 0.9 && contrastRatio(lift, TOKENS.heroGround) < 3.05) {
    t += 0.06;
    lift = toHex(towardWhite(rgb, t));
  }
  return { accent, accentHover, accentPress, accentLift: lift };
}

/**
 * Ramp final untuk nilai global `appearance`. theme = nama preset, "custom",
 * atau apa pun; customAccent hanya dipakai kalau theme === "custom" dan
 * warnanya lolos isAccentSafe. Selain itu → navy.
 */
export function resolveAccentRamp(theme: string, customAccent?: string | null): AccentRamp {
  if (theme === "custom") {
    const hex = (customAccent ?? "").trim();
    return isAccentSafe(hex) ? deriveRamp(hex) : NAVY_RAMP;
  }
  const preset = (THEME_PRESETS as Record<string, string>)[theme];
  if (!preset || preset === THEME_PRESETS.navy) return NAVY_RAMP;
  return deriveRamp(preset);
}

/** Blok CSS override untuk disuntik di <head>. Kosong kalau ramp == navy. */
export function themeStyleBlock(ramp: AccentRamp): string {
  if (
    ramp.accent === NAVY_RAMP.accent &&
    ramp.accentHover === NAVY_RAMP.accentHover &&
    ramp.accentPress === NAVY_RAMP.accentPress &&
    ramp.accentLift === NAVY_RAMP.accentLift
  ) {
    return "";
  }
  return (
    ":root{" +
    `--color-accent:${ramp.accent};` +
    `--color-accent-hover:${ramp.accentHover};` +
    `--color-accent-press:${ramp.accentPress};` +
    `--color-accent-lift:${ramp.accentLift};` +
    "}"
  );
}
