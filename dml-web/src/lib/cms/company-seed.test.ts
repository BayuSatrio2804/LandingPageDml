import { describe, expect, it } from "vitest";
import { COMPANY_PROFILE_SEED, SITE_NAVIGATION_SEED } from "./company-seed";

/**
 * Dipindah dari src/content/company.test.ts saat profil perusahaan pindah
 * ke CMS: ini sekarang guardrail atas nilai default yang dipakai
 * scripts/seed.ts untuk mengisi global company-profile/site-navigation
 * pertama kali, bukan lagi atas data yang dibaca langsung di runtime.
 */
describe("COMPANY_PROFILE_SEED", () => {
  it("mencatat tanggal berdiri sebagai ISO yang bisa diparse", () => {
    expect(Number.isNaN(Date.parse(COMPANY_PROFILE_SEED.foundedIso))).toBe(false);
    expect(new Date(COMPANY_PROFILE_SEED.foundedIso).getFullYear()).toBe(1988);
  });

  it("punya dua kantor DML, terpisah dari kantor grup", () => {
    expect(COMPANY_PROFILE_SEED.offices).toHaveLength(2);
    expect(COMPANY_PROFILE_SEED.groupOffices).toHaveLength(2);
    const dmlStreets = COMPANY_PROFILE_SEED.offices.map((office) => office.street);
    for (const group of COMPANY_PROFILE_SEED.groupOffices) {
      expect(dmlStreets).not.toContain(group.street);
    }
  });

  it("ringkasan armada memakai angka company profile resmi", () => {
    const { fleetSummary } = COMPANY_PROFILE_SEED;
    expect(fleetSummary.vessels).toBe(64);
    expect(fleetSummary.passengerVessels).toBe(9);
    expect(fleetSummary.oilTransportVessels).toBe(55);
    expect(fleetSummary.passengerVessels + fleetSummary.oilTransportVessels).toBe(
      fleetSummary.vessels,
    );
  });

  it("tiga nilai perusahaan mengeja DML", () => {
    expect(COMPANY_PROFILE_SEED.values.map((value) => value.key).join("")).toBe("DML");
  });

  it("setiap standar menandai sumbernya", () => {
    const items = COMPANY_PROFILE_SEED.standards.flatMap((cluster) => cluster.items);
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(["cp-pdf", "riset-publik", "belum-terverifikasi"]).toContain(item.source);
    }
  });

  it("nomor telepon dalam format E.164", () => {
    expect(COMPANY_PROFILE_SEED.phone).toMatch(/^\+62\d{7,13}$/);
  });

  it("whatsapp hanya berisi digit, sama dengan phone tanpa karakter non-digit", () => {
    expect(COMPANY_PROFILE_SEED.whatsapp).toMatch(/^\d+$/);
    expect(COMPANY_PROFILE_SEED.whatsapp).toBe(COMPANY_PROFILE_SEED.phone.replace(/\D/g, ""));
  });
});

describe("SITE_NAVIGATION_SEED.navItems", () => {
  it("setiap href internal diawali garis miring", () => {
    for (const item of SITE_NAVIGATION_SEED.navItems.filter((i) => !i.external)) {
      expect(item.href.startsWith("/")).toBe(true);
    }
  });

  it("setiap tautan eksternal memakai URL absolut", () => {
    for (const item of SITE_NAVIGATION_SEED.navItems.filter((i) => i.external)) {
      expect(item.href).toMatch(/^https:\/\//);
    }
  });

  it("memuat BookJambo sebagai tautan eksternal, bukan route", () => {
    const bookJambo = SITE_NAVIGATION_SEED.navItems.find((i) => i.label === "BookJambo");
    expect(bookJambo?.external).toBe(true);
    expect(bookJambo?.href).toBe("https://dutabahari.id");
  });

  it("tidak melebihi enam item, agar nav muat satu baris di desktop", () => {
    expect(SITE_NAVIGATION_SEED.navItems.length).toBeLessThanOrEqual(6);
  });
});

describe("SITE_NAVIGATION_SEED.footerGroups", () => {
  it("setiap anchor ke Tentang Kami menunjuk seksi yang benar-benar ada", () => {
    // Seksi halaman Tentang Kami sekarang: jati-diri, nilai, struktur, legal,
    // kantor. Anchor lama (#silsilah, #profil) sudah tidak ada.
    const validAnchors = ["jati-diri", "nilai", "struktur", "legal", "kantor"];
    const aboutLinks = SITE_NAVIGATION_SEED.footerGroups
      .flatMap((group) => group.items)
      .filter((item) => item.href.startsWith("/tentang-kami#"));
    expect(aboutLinks.length).toBeGreaterThan(0);
    for (const link of aboutLinks) {
      const anchor = link.href.split("#")[1];
      expect(validAnchors).toContain(anchor);
    }
  });
});
