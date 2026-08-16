import { describe, expect, it } from "vitest";
import { contrastRatio, relativeLuminance } from "./color";

describe("relativeLuminance", () => {
  it("mengembalikan 0 untuk hitam murni", () => {
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 5);
  });

  it("mengembalikan 1 untuk putih murni", () => {
    expect(relativeLuminance("#FFFFFF")).toBeCloseTo(1, 5);
  });

  it("menerima notasi tiga digit", () => {
    expect(relativeLuminance("#fff")).toBeCloseTo(1, 5);
  });

  it("menolak digit yang bukan heksadesimal", () => {
    expect(() => relativeLuminance("#GGGGGG")).toThrow(/tidak sah/);
  });

  it("menolak panjang digit yang tidak sah", () => {
    expect(() => relativeLuminance("#12345")).toThrow(/tidak sah/);
  });
});

describe("contrastRatio", () => {
  it("mengembalikan 21 untuk hitam lawan putih", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 1);
  });

  it("simetris terhadap urutan argumen", () => {
    const a = contrastRatio("#0A1418", "#FF5A1F");
    const b = contrastRatio("#FF5A1F", "#0A1418");
    expect(a).toBeCloseTo(b, 10);
  });

  it("mengembalikan 1 untuk warna yang sama", () => {
    expect(contrastRatio("#FF5A1F", "#FF5A1F")).toBeCloseTo(1, 5);
  });
});
