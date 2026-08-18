import { describe, expect, it } from "vitest";
import { clamp01, segmentAt, segmentOpacities, smoothstep } from "./segments";

describe("clamp01", () => {
  it("menjepit di luar rentang dan menolak NaN", () => {
    expect(clamp01(-3)).toBe(0);
    expect(clamp01(4)).toBe(1);
    expect(clamp01(Number.NaN)).toBe(0);
  });
});

describe("smoothstep", () => {
  it("nol di nol, satu di satu, setengah di tengah", () => {
    expect(smoothstep(0)).toBe(0);
    expect(smoothstep(1)).toBe(1);
    expect(smoothstep(0.5)).toBeCloseTo(0.5, 10);
  });
});

describe("segmentAt", () => {
  it("progress nol memilih item pertama tanpa blend", () => {
    expect(segmentAt(0, 5)).toEqual({ index: 0, blend: 0 });
  });

  it("progress satu memilih item terakhir, bukan indeks di luar batas", () => {
    expect(segmentAt(1, 5)).toEqual({ index: 4, blend: 0 });
  });

  // Inti perbaikan Plan 5. Di versi lama, progress 0,05 dari lima kelas sudah
  // memberi blend 0,2 dan kapal mulai berganti sebelum seksi sebelumnya
  // selesai. Sekarang seluruh iris pertama sampai 0,13 masih diam penuh.
  it("item pertama diam penuh selama jeda, tidak langsung meleleh", () => {
    expect(segmentAt(0.05, 5).blend).toBe(0);
    expect(segmentAt(0.12, 5).blend).toBe(0);
    expect(segmentAt(0.12, 5).index).toBe(0);
  });

  it("penyeberangan hanya terjadi di ekor tiap iris", () => {
    const mid = segmentAt(0.17, 5);
    expect(mid.index).toBe(0);
    expect(mid.blend).toBeGreaterThan(0);
    expect(mid.blend).toBeLessThan(1);
  });

  // Keluhan "Ro-Ro Ferry cuma muncul sekejap lalu halaman kosong". Item
  // terakhir harus sudah berdiri penuh jauh sebelum progress mencapai satu.
  it("item terakhir sudah penuh sepanjang 20 persen scroll terakhir", () => {
    for (const p of [0.8, 0.85, 0.9, 0.95, 1]) {
      expect(segmentAt(p, 5)).toEqual({ index: 4, blend: 0 });
    }
  });

  it("menjepit progress di luar rentang", () => {
    expect(segmentAt(-1, 5).index).toBe(0);
    expect(segmentAt(2, 5).index).toBe(4);
  });

  it("satu item saja tidak pernah membagi dengan nol", () => {
    expect(segmentAt(0.5, 1)).toEqual({ index: 0, blend: 0 });
  });

  it("dua item juga punya jeda diam di keduanya", () => {
    expect(segmentAt(0.1, 2).blend).toBe(0);
    expect(segmentAt(0.9, 2)).toEqual({ index: 1, blend: 0 });
  });
});

describe("segmentOpacities", () => {
  it("jumlah opasitas selalu satu, jadi tidak pernah ada frame setengah transparan", () => {
    for (const p of [0, 0.13, 0.17, 0.2, 0.5, 0.83, 1]) {
      const total = segmentOpacities(segmentAt(p, 5), 5).reduce((a, b) => a + b, 0);
      expect(total).toBeCloseTo(1, 10);
    }
  });

  it("hanya pasangan aktif yang tidak nol", () => {
    const values = segmentOpacities(segmentAt(0.17, 5), 5);
    expect(values.filter((v) => v > 0)).toHaveLength(2);
    expect(values[0]).toBeGreaterThan(0);
    expect(values[1]).toBeGreaterThan(0);
  });
});
