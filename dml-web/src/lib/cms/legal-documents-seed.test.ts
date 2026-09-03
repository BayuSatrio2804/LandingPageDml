import { describe, expect, it } from "vitest";
import { LEGAL_DOCUMENTS_SEED } from "./legal-documents-seed";
import { LEGAL_GROUPS } from "@/content/about";

describe("LEGAL_DOCUMENTS_SEED", () => {
  it("memuat sembilan baris sesuai tabel PDF halaman 06", () => {
    expect(LEGAL_DOCUMENTS_SEED).toHaveLength(9);
  });

  it("setiap baris punya dokumen, nomor, dan penerbit yang terisi", () => {
    for (const entry of LEGAL_DOCUMENTS_SEED) {
      expect(entry.document.trim().length, `dokumen kosong: ${entry.number}`).toBeGreaterThan(0);
      expect(entry.number.trim().length, `nomor kosong: ${entry.document}`).toBeGreaterThan(0);
      expect(entry.issuer.trim().length, `penerbit kosong: ${entry.document}`).toBeGreaterThan(0);
    }
  });

  it("seluruhnya bersumber company profile, bukan riset publik", () => {
    for (const entry of LEGAL_DOCUMENTS_SEED) {
      expect(entry.source, entry.document).toBe("cp-pdf");
    }
  });

  it("tidak ada nomor dokumen duplikat", () => {
    const numbers = LEGAL_DOCUMENTS_SEED.map((entry) => entry.number);
    expect(new Set(numbers).size).toBe(numbers.length);
  });

  it("memuat NPWP dan NIB, dua dokumen yang paling sering ditanyakan mitra", () => {
    const documents = LEGAL_DOCUMENTS_SEED.map((entry) => entry.document).join(" ");
    expect(documents).toContain("NPWP");
    expect(documents).toContain("NIB");
  });

  it("order tiap dokumen unik", () => {
    const orders = LEGAL_DOCUMENTS_SEED.map((entry) => entry.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  // Invarian silang dengan about.ts: setiap nama dokumen yang dirujuk
  // LEGAL_GROUPS wajib cocok PERSIS dengan salah satu entri seed ini,
  // karena groupedLegalDocuments() mencocokkan lewat nama, bukan id, dan
  // diam-diam membuang baris yang tidak ketemu (lihat about.ts). Sembilan
  // dokumen di sini harus terdistribusi persis ke tiga kelompok, tidak
  // kurang.
  it("setiap dokumen di LEGAL_GROUPS merujuk entri yang benar-benar ada di seed", () => {
    const knownNames = new Set(LEGAL_DOCUMENTS_SEED.map((entry) => entry.document));
    const referenced = LEGAL_GROUPS.flatMap((group) => group.documents);
    expect(referenced).toHaveLength(9);
    for (const name of referenced) {
      expect(knownNames.has(name), name).toBe(true);
    }
  });
});
