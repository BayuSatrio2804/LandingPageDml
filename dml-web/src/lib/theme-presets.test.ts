import { describe, expect, it } from "vitest";
import { contrastRatio, relativeLuminance } from "./color";
import { TOKENS } from "./tokens";
import { THEME_PRESETS, type ThemePreset } from "./theme-presets";

/**
 * Preset warna aksen mewarisi seluruh bidang halaman & bidang gelap dari
 * TOKENS (Navy Selat), jadi asersi di sini cuma menguji keluarga aksennya
 * terhadap warna tetap itu. Ambangnya sama dengan tokens.test.ts.
 */
const NAMES = Object.keys(THEME_PRESETS) as ThemePreset[];

describe.each(NAMES)("preset aksen %s", (name) => {
  const p = THEME_PRESETS[name];

  it("teks putih lolos AA di seluruh state tombol terisi", () => {
    for (const bg of [p.accent, p.accentHover, p.accentPress]) {
      expect(contrastRatio(TOKENS.onAccent, bg)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("aksen sebagai teks di atas bidang halaman lolos AA", () => {
    expect(contrastRatio(p.accent, TOKENS.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.accent, TOKENS.surface2)).toBeGreaterThanOrEqual(4.5);
  });

  it("aksen sebagai teks di atas isian aksen tipis lolos AA", () => {
    expect(contrastRatio(p.accent, TOKENS.accentSoft)).toBeGreaterThanOrEqual(4.5);
  });

  it("surface3 sebagai teks di atas aksen lolos AA (kaki & kepala halaman)", () => {
    expect(contrastRatio(TOKENS.surface3, p.accent)).toBeGreaterThanOrEqual(4.5);
  });

  it("hover lebih gelap dari aksen, press lebih gelap dari hover", () => {
    expect(relativeLuminance(p.accentHover)).toBeLessThan(relativeLuminance(p.accent));
    expect(relativeLuminance(p.accentPress)).toBeLessThan(relativeLuminance(p.accentHover));
  });

  it("aksen terangkat lolos 3:1 di atas bidang gelap hero", () => {
    expect(contrastRatio(p.accentLift, TOKENS.heroGround)).toBeGreaterThanOrEqual(3);
  });
});

it("preset navy identik dengan TOKENS", () => {
  expect(THEME_PRESETS.navy).toEqual({
    accent: TOKENS.accent,
    accentHover: TOKENS.accentHover,
    accentPress: TOKENS.accentPress,
    accentLift: TOKENS.accentLift,
  });
});
