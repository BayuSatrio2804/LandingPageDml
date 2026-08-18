import { describe, expect, it } from "vitest";
import { yearsOperating } from "./years-operating";

describe("yearsOperating", () => {
  it("menghitung tahun penuh sejak tanggal pendirian", () => {
    expect(yearsOperating("1988-11-30", new Date("2026-08-18T00:00:00Z"))).toBe(37);
  });

  it("belum menambah tahun sebelum tanggal ulang tahun terlewati", () => {
    expect(yearsOperating("1988-11-30", new Date("2026-11-29T00:00:00Z"))).toBe(37);
    expect(yearsOperating("1988-11-30", new Date("2026-11-30T00:00:00Z"))).toBe(38);
  });
});
