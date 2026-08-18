import { describe, expect, it } from "vitest";
import { COMPANY, GROUP_OFFICES } from "./company";
import { NAV_ITEMS } from "./navigation";

describe("COMPANY", () => {
  it("mencatat tanggal berdiri sebagai ISO yang bisa diparse", () => {
    expect(Number.isNaN(Date.parse(COMPANY.foundedIso))).toBe(false);
    expect(new Date(COMPANY.foundedIso).getFullYear()).toBe(1988);
  });

  // Kantor DML sendiri saja. Dua kantor grup Sinar Alam hidup di
  // GROUP_OFFICES supaya footer dan halaman kontak tidak pernah mengirim
  // orang ke alamat yang bukan alamat DML.
  it("punya dua kantor DML, terpisah dari kantor grup", () => {
    expect(COMPANY.offices).toHaveLength(2);
    expect(GROUP_OFFICES).toHaveLength(2);
    const dmlStreets = COMPANY.offices.map((office) => office.street);
    for (const group of GROUP_OFFICES) {
      expect(dmlStreets).not.toContain(group.street);
    }
  });

  // Koreksi utama Plan 5. Angka lama datang dari riset publik, PDF resmi
  // menyebut 64 kapal yang terdiri dari 9 ro-ro dan 55 pengangkut BBM.
  it("ringkasan armada memakai angka company profile resmi", () => {
    expect(COMPANY.fleetSummary.vessels).toBe(64);
    expect(COMPANY.fleetSummary.passengerVessels).toBe(9);
    expect(COMPANY.fleetSummary.oilTransportVessels).toBe(55);
    expect(
      COMPANY.fleetSummary.passengerVessels + COMPANY.fleetSummary.oilTransportVessels,
    ).toBe(COMPANY.fleetSummary.vessels);
  });

  it("tiga nilai perusahaan mengeja DML", () => {
    expect(COMPANY.values.map((value) => value.key).join("")).toBe("DML");
  });

  // Setiap butir standar harus menyatakan asalnya. Tanpa ini, butir hasil
  // riset publik dan butir yang punya dasar dokumen resmi tampil identik dan
  // klien tidak punya cara memisahkannya saat verifikasi.
  it("setiap standar menandai sumbernya", () => {
    const items = COMPANY.standards.flatMap((cluster) => cluster.items);
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(["cp-pdf", "riset-publik"]).toContain(item.source);
    }
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
