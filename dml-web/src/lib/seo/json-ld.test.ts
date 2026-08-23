import { describe, expect, it } from "vitest";
import {
  articleJsonLd,
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
    expect(data.foundingDate).toBe("1988-11-30");
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

describe("articleJsonLd", () => {
  const input = {
    title: "Operasi ship to ship",
    description: "Ringkasan.",
    path: "/artikel/operasi-sts",
    publishedAt: "2026-08-23T00:00:00.000Z",
    imageUrl: "https://contoh.test/media/kapal.jpg",
    authorName: "Redaksi DML",
  };

  it("memakai tipe Article dengan URL absolut", () => {
    const data = articleJsonLd(input) as Record<string, unknown>;
    expect(data["@type"]).toBe("Article");
    expect(String(data.mainEntityOfPage)).toMatch(/\/artikel\/operasi-sts$/);
    expect(String(data.mainEntityOfPage)).toMatch(/^https?:\/\//);
  });

  it("membawa penulis dan tanggal terbit", () => {
    const data = articleJsonLd(input) as Record<string, unknown>;
    expect(data.author).toEqual({ "@type": "Person", name: "Redaksi DML" });
    expect(data.datePublished).toBe("2026-08-23T00:00:00.000Z");
  });

  it("menghilangkan penulis dan gambar kalau tidak ada, bukan mengisinya kosong", () => {
    const data = articleJsonLd({
      title: "T",
      description: "D",
      path: "/artikel/t",
      publishedAt: "2026-08-23T00:00:00.000Z",
    }) as Record<string, unknown>;
    expect("author" in data).toBe(false);
    expect("image" in data).toBe(false);
  });

  it("aman saat judul artikel memuat penutup script", () => {
    // Inilah alasan escape "<" dipasang di safeJsonLdString sejak Plan 3.
    // Judul artikel adalah input admin, dan ini pemakaian pertamanya.
    const data = articleJsonLd({
      ...input,
      title: 'Judul </script><script>alert(1)</script>',
    });
    expect(safeJsonLdString(data)).not.toContain("</script>");
  });
});
