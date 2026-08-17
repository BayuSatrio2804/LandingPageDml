import { describe, expect, it } from "vitest";
import { TIMELINE } from "./timeline";

describe("TIMELINE", () => {
  it("tidak kosong", () => {
    expect(TIMELINE.length).toBeGreaterThan(0);
  });

  it("terurut menaik berdasarkan tahun", () => {
    const years = TIMELINE.map((entry) => entry.year);
    const sorted = [...years].sort((a, b) => a - b);
    expect(years).toEqual(sorted);
  });

  it("entri pertama adalah tahun berdirinya perusahaan", () => {
    expect(TIMELINE[0]?.year).toBe(1985);
  });
});
