import { describe, expect, it } from "vitest";
import { DECK_MATERIAL, HULL_MATERIAL, ACCENT_LINE_COLOR } from "./materials";

describe("material panggung", () => {
  // Dua lambung di comparator dibangun dari geometri dan harus menyatu dengan
  // tiga model GLB dalam satu frame. Satu-satunya cara itu terjadi adalah
  // kalau nilainya datang dari satu tempat, bukan dipilih ulang per komponen.
  it("lambung dan geladak memakai rentang metalness dan roughness yang wajar", () => {
    for (const material of [HULL_MATERIAL, DECK_MATERIAL]) {
      expect(material.metalness).toBeGreaterThanOrEqual(0);
      expect(material.metalness).toBeLessThanOrEqual(1);
      expect(material.roughness).toBeGreaterThan(0);
      expect(material.roughness).toBeLessThanOrEqual(1);
      expect(material.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("garis ukur memakai token aksen situs", () => {
    expect(ACCENT_LINE_COLOR).toBe("#C62828");
  });
});
