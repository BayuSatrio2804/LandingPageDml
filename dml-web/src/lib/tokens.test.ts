import { describe, expect, it } from "vitest";
import { contrastRatio, relativeLuminance } from "./color";
import { TOKENS } from "./tokens";

describe("kontras token Deep Water", () => {
  it("teks utama di atas latar utama lolos AAA", () => {
    expect(contrastRatio(TOKENS.ink, TOKENS.surface)).toBeGreaterThanOrEqual(7);
  });

  it("teks sekunder di atas latar utama lolos AA", () => {
    expect(contrastRatio(TOKENS.inkMuted, TOKENS.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it("aksen sebagai teks di atas latar utama lolos AA", () => {
    expect(contrastRatio(TOKENS.accent, TOKENS.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it("teks on-accent di atas permukaan aksen lolos AA", () => {
    expect(contrastRatio(TOKENS.onAccent, TOKENS.accent)).toBeGreaterThanOrEqual(4.5);
  });

  it("teks ink di atas permukaan aksen GAGAL, ini yang dilarang spec", () => {
    expect(contrastRatio(TOKENS.ink, TOKENS.accent)).toBeLessThan(4.5);
  });

  it("hover lebih terang daripada aksen dasar karena halaman gelap", () => {
    expect(relativeLuminance(TOKENS.accentHover)).toBeGreaterThan(
      relativeLuminance(TOKENS.accent),
    );
  });

  it("state tertekan lebih gelap daripada aksen dasar", () => {
    expect(relativeLuminance(TOKENS.accentPress)).toBeLessThan(
      relativeLuminance(TOKENS.accent),
    );
  });
});
