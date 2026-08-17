import { describe, expect, it } from "vitest";
import { COMPANY } from "./company";
import { NAV_ITEMS } from "./navigation";

describe("COMPANY", () => {
  it("mencatat tanggal berdiri sebagai ISO yang bisa diparse", () => {
    expect(Number.isNaN(Date.parse(COMPANY.foundedIso))).toBe(false);
    expect(new Date(COMPANY.foundedIso).getFullYear()).toBe(1985);
  });

  it("punya dua kantor", () => {
    expect(COMPANY.offices).toHaveLength(2);
  });

  it("nomor telepon dalam format E.164", () => {
    expect(COMPANY.phone).toMatch(/^\+62\d{7,13}$/);
  });
});

describe("COMPANY.whatsapp", () => {
  it("hanya berisi digit, tanpa tanda plus atau spasi", () => {
    expect(COMPANY.whatsapp).toMatch(/^\d+$/);
  });

  it("sama dengan COMPANY.phone tanpa karakter non-digit", () => {
    expect(COMPANY.whatsapp).toBe(COMPANY.phone.replace(/\D/g, ""));
  });
});

describe("NAV_ITEMS", () => {
  it("setiap href internal diawali garis miring", () => {
    for (const item of NAV_ITEMS.filter((i) => !i.external)) {
      expect(item.href.startsWith("/")).toBe(true);
    }
  });

  it("setiap tautan eksternal memakai URL absolut", () => {
    for (const item of NAV_ITEMS.filter((i) => i.external)) {
      expect(item.href).toMatch(/^https:\/\//);
    }
  });

  it("memuat BookJambo sebagai tautan eksternal, bukan route", () => {
    const bookJambo = NAV_ITEMS.find((i) => i.label === "BookJambo");
    expect(bookJambo?.external).toBe(true);
    expect(bookJambo?.href).toBe("https://dutabahari.id");
  });

  it("tidak melebihi enam item, agar nav muat satu baris di desktop", () => {
    expect(NAV_ITEMS.length).toBeLessThanOrEqual(6);
  });
});
