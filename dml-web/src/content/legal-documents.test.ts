import { describe, expect, it } from "vitest";
import { LEGAL_DOCUMENTS } from "./legal-documents";

describe("LEGAL_DOCUMENTS", () => {
  it("memuat sembilan baris sesuai tabel PDF halaman 06", () => {
    expect(LEGAL_DOCUMENTS).toHaveLength(9);
  });

  it("setiap baris punya dokumen, nomor, dan penerbit yang terisi", () => {
    for (const entry of LEGAL_DOCUMENTS) {
      expect(entry.document.trim().length, `dokumen kosong: ${entry.number}`).toBeGreaterThan(0);
      expect(entry.number.trim().length, `nomor kosong: ${entry.document}`).toBeGreaterThan(0);
      expect(entry.issuer.trim().length, `penerbit kosong: ${entry.document}`).toBeGreaterThan(0);
    }
  });

  it("seluruhnya bersumber company profile, bukan riset publik", () => {
    for (const entry of LEGAL_DOCUMENTS) {
      expect(entry.source, entry.document).toBe("cp-pdf");
    }
  });

  it("tidak ada nomor dokumen duplikat", () => {
    const numbers = LEGAL_DOCUMENTS.map((entry) => entry.number);
    expect(new Set(numbers).size).toBe(numbers.length);
  });

  it("memuat NPWP dan NIB, dua dokumen yang paling sering ditanyakan mitra", () => {
    const documents = LEGAL_DOCUMENTS.map((entry) => entry.document).join(" ");
    expect(documents).toContain("NPWP");
    expect(documents).toContain("NIB");
  });
});
