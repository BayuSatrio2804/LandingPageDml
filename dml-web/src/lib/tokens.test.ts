import { describe, expect, it } from "vitest";
import { contrastRatio, relativeLuminance } from "./color";
import { TOKENS } from "./tokens";

describe("kontras token Navy Selat", () => {
  it("teks utama di atas kedua bidang halaman lolos AAA", () => {
    expect(contrastRatio(TOKENS.ink, TOKENS.surface)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(TOKENS.ink, TOKENS.surface2)).toBeGreaterThanOrEqual(7);
  });

  // surface2 ikut diuji karena input form memasang placeholder ink-muted di
  // atasnya, bukan di atas surface. Di palet gelap yang lama dua bidang itu
  // nyaris sama gelapnya jadi satu pengujian cukup; sekarang jaraknya nyata.
  it("teks sekunder di atas kedua bidang halaman lolos AA", () => {
    expect(contrastRatio(TOKENS.inkMuted, TOKENS.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(TOKENS.inkMuted, TOKENS.surface2)).toBeGreaterThanOrEqual(4.5);
  });

  it("aksen sebagai teks di atas latar utama lolos AA", () => {
    expect(contrastRatio(TOKENS.accent, TOKENS.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it("aksen sebagai teks di atas isian navy tipis tetap lolos AA", () => {
    expect(contrastRatio(TOKENS.accent, TOKENS.accentSoft)).toBeGreaterThanOrEqual(4.5);
  });

  it("teks on-accent lolos AA di seluruh state tombol terisi", () => {
    for (const surface of [TOKENS.accent, TOKENS.accentHover, TOKENS.accentPress]) {
      expect(contrastRatio(TOKENS.onAccent, surface)).toBeGreaterThanOrEqual(4.5);
    }
  });

  // Dua-duanya gelap, jadi menaruh teks ink di atas tombol navy menghasilkan
  // gumpalan tanpa label. Pengujian ini yang menahan kombinasi itu masuk lagi.
  it("teks ink di atas permukaan aksen GAGAL, ini yang dilarang spec", () => {
    expect(contrastRatio(TOKENS.ink, TOKENS.accent)).toBeLessThan(4.5);
  });

  it("merah galat lolos AA sebagai teks dan sebagai latar", () => {
    expect(contrastRatio(TOKENS.danger, TOKENS.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(TOKENS.danger, TOKENS.surface2)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(TOKENS.onAccent, TOKENS.danger)).toBeGreaterThanOrEqual(4.5);
  });

  // WCAG 1.4.11: batas komponen non-teks butuh 3:1. Ini alasan token line ada
  // dan alasan tepi input tidak boleh jatuh ke surface3.
  it("garis kontrol lolos 3:1 di atas kedua bidang halaman", () => {
    expect(contrastRatio(TOKENS.line, TOKENS.surface)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(TOKENS.line, TOKENS.surface2)).toBeGreaterThanOrEqual(3);
  });

  it("hover lebih gelap daripada aksen dasar karena halaman terang", () => {
    expect(relativeLuminance(TOKENS.accentHover)).toBeLessThan(
      relativeLuminance(TOKENS.accent),
    );
  });

  it("state tertekan lebih gelap daripada hover, jadi arahnya satu", () => {
    expect(relativeLuminance(TOKENS.accentPress)).toBeLessThan(
      relativeLuminance(TOKENS.accentHover),
    );
  });

  // Penanda pintu hero adalah elemen non-teks. WCAG 1.4.11 menuntut 3:1 untuk
  // itu, bukan 4,5:1. Navy dasar tidak lolos di atas bidang gelap hero, dan
  // itulah alasan accentLift ada sebagai token terpisah.
  it("aksen terangkat lolos 3:1 di atas bidang gelap hero", () => {
    expect(contrastRatio(TOKENS.accentLift, TOKENS.heroGround)).toBeGreaterThanOrEqual(3);
  });

  it("teks putih lolos AAA di atas bidang gelap hero", () => {
    expect(contrastRatio(TOKENS.onAccent, TOKENS.heroGround)).toBeGreaterThanOrEqual(7);
  });
});
