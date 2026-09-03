import { describe, expect, it } from "vitest";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  localBusinessJsonLd,
  organizationJsonLd,
  safeJsonLdString,
  serviceJsonLd,
} from "./json-ld";
import type { Company } from "@/content/types";
import { absoluteUrl } from "./metadata";

/**
 * Fixture minimal, bukan import dari @/content/company: fungsi-fungsi ini
 * sekarang menerima company sebagai parameter (datanya datang dari CMS),
 * jadi test tidak lagi perlu bergantung pada data produksi yang bisa
 * berubah kapan saja lewat /admin.
 */
const COMPANY: Company = {
  legalName: "PT Dutabahari Menara Line",
  shortName: "Dutabahari Menara Line",
  abbreviation: "DML",
  tagline: "From Zero to Hero with Continuous Improvement",
  foundedIso: "1988-11-30",
  founder: "Herman Chandra",
  parent: "Sinar Alam Corporation",
  phone: "+625116773845",
  whatsapp: "625116773845",
  bookingUrl: "https://dutabahari.id",
  offices: [
    { label: "Kantor Pusat DML", street: "Jl. AES Nasution 43", city: "Banjarmasin", postalCode: "70123", province: "Kalimantan Selatan", phone: "+62 511 6773845" },
    { label: "Kantor Cabang Banyuwangi", street: "Jl. Kalipuro, Ketapang", city: "Banyuwangi", province: "Jawa Timur" },
  ],
  values: [
    { key: "D", term: "Dynamic", description: "Gesit dan mudah menyesuaikan diri." },
    { key: "M", term: "Measurable", description: "Target yang jelas dan terukur." },
    { key: "L", term: "Loyalty", description: "Hubungan jangka panjang." },
  ],
  standards: [{ label: "Sistem manajemen", items: [{ name: "ISO 9001:2015", source: "cp-pdf" }] }],
  memberships: [{ name: "Sinar Alam Corporation" }],
  fleetSummary: { vessels: 64, passengerVessels: 9, oilTransportVessels: 55, people: 300 },
};

describe("organizationJsonLd", () => {
  const data = organizationJsonLd(COMPANY) as Record<string, unknown>;

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
    updatedAt: "2026-08-24T00:00:00.000Z",
    imageUrl: "https://contoh.test/media/kapal.jpg",
    authorName: "Redaksi DML",
  };

  it("memakai tipe Article dengan URL absolut", () => {
    const data = articleJsonLd(COMPANY, input) as Record<string, unknown>;
    expect(data["@type"]).toBe("Article");
    expect(String(data.mainEntityOfPage)).toMatch(/\/artikel\/operasi-sts$/);
    expect(String(data.mainEntityOfPage)).toMatch(/^https?:\/\//);
  });

  it("membawa penulis dan tanggal terbit", () => {
    const data = articleJsonLd(COMPANY, input) as Record<string, unknown>;
    expect(data.author).toEqual({ "@type": "Person", name: "Redaksi DML" });
    expect(data.datePublished).toBe("2026-08-23T00:00:00.000Z");
    expect(data.dateModified).toBe("2026-08-24T00:00:00.000Z");
  });

  it("menghilangkan penulis dan gambar kalau tidak ada, bukan mengisinya kosong", () => {
    const data = articleJsonLd(COMPANY, {
      title: "T",
      description: "D",
      path: "/artikel/t",
      publishedAt: "2026-08-23T00:00:00.000Z",
      updatedAt: "2026-08-23T00:00:00.000Z",
    }) as Record<string, unknown>;
    expect("author" in data).toBe(false);
    expect("image" in data).toBe(false);
  });

  it("aman saat judul artikel memuat penutup script", () => {
    // Inilah alasan escape "<" dipasang di safeJsonLdString sejak Plan 3.
    // Judul artikel adalah input admin, dan ini pemakaian pertamanya.
    const data = articleJsonLd(COMPANY, {
      ...input,
      title: 'Judul </script><script>alert(1)</script>',
    });
    expect(safeJsonLdString(data)).not.toContain("</script>");
  });
});

describe("serviceJsonLd", () => {
  const data = serviceJsonLd(COMPANY, {
    name: "Transportasi BBM",
    description: "Distribusi bahan bakar cair ke pelabuhan dan pulau utama Indonesia.",
    path: "/bisnis/transportasi-bbm",
  }) as Record<string, unknown>;

  it("memakai tipe Service", () => {
    expect(data["@type"]).toBe("Service");
    expect(data.name).toBe("Transportasi BBM");
  });

  it("provider menunjuk organisasi yang sama dengan JSON-LD root", () => {
    expect(data.provider).toMatchObject({
      "@type": "Organization",
      name: COMPANY.legalName,
    });
  });

  it("url absolut", () => {
    expect(String(data.url)).toBe(absoluteUrl("/bisnis/transportasi-bbm"));
  });
});

describe("localBusinessJsonLd", () => {
  const data = localBusinessJsonLd(COMPANY) as Record<string, unknown>;

  it("memakai tipe LocalBusiness", () => {
    expect(data["@type"]).toBe("LocalBusiness");
  });

  it("membawa kedua kantor dari COMPANY.offices", () => {
    expect(Array.isArray(data.address)).toBe(true);
    expect((data.address as unknown[]).length).toBe(COMPANY.offices.length);
  });

  it("membawa telepon", () => {
    expect(data.telephone).toBe(COMPANY.phone);
  });
});
