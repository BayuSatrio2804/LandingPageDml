import { describe, expect, it } from "vitest";
import { BUSINESS_LINES_SEED } from "./business-lines-seed";

describe("BUSINESS_LINES_SEED", () => {
  it("dua lini utama dan tiga afiliasi", () => {
    const mainLines = BUSINESS_LINES_SEED.filter((line) => line.kind === "lini-utama");
    const affiliates = BUSINESS_LINES_SEED.filter((line) => line.kind === "afiliasi");
    expect(mainLines).toHaveLength(2);
    expect(affiliates).toHaveLength(3);
  });

  it("setiap slug unik", () => {
    const slugs = BUSINESS_LINES_SEED.map((line) => line.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("afiliasi tidak punya metrik (bukan armada milik DML)", () => {
    for (const line of BUSINESS_LINES_SEED.filter((l) => l.kind === "afiliasi")) {
      expect(line.metric).toBeNull();
    }
  });

  it("lini utama punya metrik kapal", () => {
    for (const line of BUSINESS_LINES_SEED.filter((l) => l.kind === "lini-utama")) {
      expect(line.metric).not.toBeNull();
      expect(line.metric?.value).toMatch(/^\d+$/);
    }
  });

  // Rute Merak-Bakauheni dioperasikan Tri Sumaja Lines, bukan DML. Kalau
  // afiliasi ini pernah diberi label "Dijalankan langsung oleh..." itu
  // klaim yang salah.
  it("afiliasi berlabel Afiliasi, bukan diklaim dijalankan DML", () => {
    for (const line of BUSINESS_LINES_SEED.filter((l) => l.kind === "afiliasi")) {
      expect(line.operator).toBe("Afiliasi");
    }
  });
});
