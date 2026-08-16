import { describe, expect, it } from "vitest";
import {
  breadcrumbJsonLd,
  organizationJsonLd,
  safeJsonLdString,
} from "./json-ld";

describe("organizationJsonLd", () => {
  const data = organizationJsonLd() as Record<string, unknown>;

  it("memakai tipe Organization", () => {
    expect(data["@type"]).toBe("Organization");
  });

  it("mencantumkan tanggal berdiri", () => {
    expect(data.foundingDate).toBe("1985-11-30");
  });

  it("mencantumkan kedua alamat kantor", () => {
    expect(Array.isArray(data.address)).toBe(true);
    expect((data.address as unknown[]).length).toBe(2);
  });

  it("memakai URL absolut", () => {
    expect(String(data.url)).toMatch(/^https?:\/\//);
  });
});

describe("breadcrumbJsonLd", () => {
  const data = breadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Bisnis Kami", path: "/bisnis" },
  ]) as Record<string, unknown>;

  it("memakai tipe BreadcrumbList", () => {
    expect(data["@type"]).toBe("BreadcrumbList");
  });

  it("memberi posisi berurutan mulai dari satu", () => {
    const items = data.itemListElement as Array<Record<string, unknown>>;
    expect(items.map((i) => i.position)).toEqual([1, 2]);
  });

  it("mengubah path relatif jadi URL absolut", () => {
    const items = data.itemListElement as Array<Record<string, unknown>>;
    // Optional chaining, bukan non-null assertion: noUncheckedIndexedAccess
    // membuat items[1] bertipe T | undefined, dan kalau memang undefined tes
    // ini gagal wajar lewat toMatch, bukan lewat klaim ke compiler.
    expect(String(items[1]?.item)).toMatch(/^https?:\/\/.+\/bisnis$/);
  });
});

describe("safeJsonLdString", () => {
  it("tidak meloloskan tanda kurung siku buka mentah sehingga tag script tidak bisa ditutup paksa", () => {
    const out = safeJsonLdString({
      evil: "</script><script>alert(1)</script>",
    });
    expect(out).not.toContain("</script>");
    expect(out).not.toContain("<");
  });

  it("hasilnya tetap JSON valid dan identik setelah dibaca balik lewat JSON.parse", () => {
    const payload = { evil: "</script>" };
    expect(JSON.parse(safeJsonLdString(payload))).toEqual(payload);
  });
});
