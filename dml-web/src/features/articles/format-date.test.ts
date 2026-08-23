import { describe, expect, it } from "vitest";
import { formatTanggal } from "./format-date";

describe("formatTanggal", () => {
  it("menulis tanggal dalam bahasa Indonesia", () => {
    expect(formatTanggal("2026-08-23T00:00:00.000Z")).toBe("23 Agustus 2026");
  });

  it("menangani bulan satu digit tanpa nol di depan", () => {
    expect(formatTanggal("2026-01-05T00:00:00.000Z")).toBe("5 Januari 2026");
  });

  it("mengembalikan string kosong untuk nilai yang tidak bisa dibaca", () => {
    // publishedAt bersifat required di koleksi, tapi data lama atau impor
    // manual bisa melanggarnya. Halaman tidak boleh crash karena itu.
    expect(formatTanggal("bukan-tanggal")).toBe("");
  });
});
