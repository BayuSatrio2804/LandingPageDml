import { describe, expect, it } from "vitest";
import { activeClassIndex } from "./class-index";

describe("activeClassIndex", () => {
  it("progress nol memilih kelas pertama tanpa blend", () => {
    expect(activeClassIndex(0, 5)).toEqual({ index: 0, blend: 0 });
  });

  // Batas akhir adalah tempat versi lama diam-diam rusak: index melewati
  // panjang array, opacity semua nol, canvas kosong tanpa error.
  it("progress satu memilih kelas terakhir, bukan indeks di luar batas", () => {
    expect(activeClassIndex(1, 5)).toEqual({ index: 4, blend: 0 });
  });

  it("progress di tengah dua kelas memberi blend proporsional", () => {
    const { index, blend } = activeClassIndex(0.125, 5);
    expect(index).toBe(0);
    expect(blend).toBeCloseTo(0.5, 6);
  });

  it("menjepit progress di luar rentang", () => {
    expect(activeClassIndex(-1, 5).index).toBe(0);
    expect(activeClassIndex(2, 5).index).toBe(4);
  });

  it("satu kelas saja tidak pernah membagi dengan nol", () => {
    expect(activeClassIndex(0.5, 1)).toEqual({ index: 0, blend: 0 });
  });
});
