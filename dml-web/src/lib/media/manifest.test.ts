import { describe, expect, it } from "vitest";
import { MEDIA, avifSrc, avifSrcSet } from "./manifest";

describe("MEDIA manifest", () => {
  it("setiap set punya minimal satu frame", () => {
    for (const [id, set] of Object.entries(MEDIA)) {
      expect(set.length, `set ${id} kosong`).toBeGreaterThan(0);
    }
  });

  it("setiap frame punya alt text bahasa Indonesia non-kosong", () => {
    for (const set of Object.values(MEDIA)) {
      for (const asset of set) {
        expect(asset.alt.length).toBeGreaterThan(0);
      }
    }
  });

  it("avifSrc merangkai basePath, lebar, dan ekstensi avif", () => {
    const asset = MEDIA["hari"][0];
    expect(asset).toBeDefined();
    if (!asset) return;
    expect(avifSrc(asset, 1600)).toBe(`${asset.basePath}-1600.avif`);
  });

  it("avifSrcSet mencakup keempat lebar", () => {
    const asset = MEDIA["hari"][0];
    expect(asset).toBeDefined();
    if (!asset) return;
    const srcSet = avifSrcSet(asset);
    for (const width of asset.widths) {
      expect(srcSet).toContain(`${width}w`);
    }
  });
});
