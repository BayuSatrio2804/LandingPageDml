import { describe, expect, it } from "vitest";
import { contrastRatio, relativeLuminance } from "./color";
import { TOKENS } from "./tokens";
import {
  THEME_PRESETS,
  NAVY_RAMP,
  deriveRamp,
  isAccentSafe,
  resolveAccentRamp,
  themeStyleBlock,
  type ThemePreset,
} from "./theme-presets";

const NAMES = Object.keys(THEME_PRESETS) as ThemePreset[];

describe.each(NAMES)("preset aksen %s", (name) => {
  const ramp = deriveRamp(THEME_PRESETS[name]);

  it("aksen lolos isAccentSafe", () => {
    expect(isAccentSafe(THEME_PRESETS[name])).toBe(true);
  });

  it("teks putih lolos AA di seluruh state tombol terisi", () => {
    for (const bg of [ramp.accent, ramp.accentHover, ramp.accentPress]) {
      expect(contrastRatio(TOKENS.onAccent, bg)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("surface3 sebagai teks di atas aksen lolos AA", () => {
    expect(contrastRatio(TOKENS.surface3, ramp.accent)).toBeGreaterThanOrEqual(4.5);
  });

  it("hover lebih gelap dari aksen, press lebih gelap dari hover", () => {
    expect(relativeLuminance(ramp.accentHover)).toBeLessThan(relativeLuminance(ramp.accent));
    expect(relativeLuminance(ramp.accentPress)).toBeLessThan(relativeLuminance(ramp.accentHover));
  });

  it("aksen terangkat lolos 3:1 di atas bidang gelap hero", () => {
    expect(contrastRatio(ramp.accentLift, TOKENS.heroGround)).toBeGreaterThanOrEqual(3);
  });
});

it("preset navy identik dengan NAVY_RAMP dan tidak memancarkan style", () => {
  expect(THEME_PRESETS.navy).toBe(TOKENS.accent);
  expect(resolveAccentRamp("navy")).toEqual(NAVY_RAMP);
  expect(themeStyleBlock(resolveAccentRamp("navy"))).toBe("");
});

describe("warna kustom", () => {
  it("hex aman menghasilkan ramp turunan dan style", () => {
    const ramp = resolveAccentRamp("custom", "#3A1F5C");
    expect(ramp.accent).toBe("#3a1f5c");
    expect(themeStyleBlock(ramp)).toContain("--color-accent:#3a1f5c");
  });

  it("hex terlalu terang diabaikan, jatuh ke navy", () => {
    expect(resolveAccentRamp("custom", "#88CCEE")).toEqual(NAVY_RAMP);
  });

  it("hex tidak sah diabaikan, jatuh ke navy", () => {
    expect(resolveAccentRamp("custom", "bukan-hex")).toEqual(NAVY_RAMP);
    expect(resolveAccentRamp("custom", "")).toEqual(NAVY_RAMP);
    expect(resolveAccentRamp("custom", null)).toEqual(NAVY_RAMP);
  });

  it("nama tema tak dikenal jatuh ke navy", () => {
    expect(resolveAccentRamp("entah-apa")).toEqual(NAVY_RAMP);
  });
});
