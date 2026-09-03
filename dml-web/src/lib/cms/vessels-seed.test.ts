import { describe, expect, it } from "vitest";
import { VESSELS_SEED } from "./vessels-seed";
import { FLEET_CLASSES_SEED } from "./fleet-classes-seed";
import { ROUTE_LEGS } from "@/features/route-map/ports";

/**
 * Jumlah kapal per kelas menurut daftar armada cp-pdf hal. 04 (7 MT, 9 OB,
 * 30 SPOB, 11 TB, 9 ro-ro). Sejak kelas armada pindah ke CMS Fase 3, angka
 * ini tidak lagi tersimpan di fleet-classes-seed.ts (dihitung live dari
 * koleksi `vessels`, lihat src/lib/cms/fleet-classes.ts) — literal di sini
 * hanya menjaga seed VESSELS_SEED tetap konsisten saat pertama kali diisi.
 */
const EXPECTED_COUNT_BY_SLUG: Record<string, number> = {
  "motor-tanker": 7,
  "oil-barge": 9,
  spob: 30,
  tugboat: 11,
  "ro-ro-ferry": 9,
};

function vesselsByClass(classSlug: string) {
  return VESSELS_SEED.filter((vessel) => vessel.classSlug === classSlug);
}

function vesselsByRoute(routeId: string) {
  return VESSELS_SEED.filter(
    (vessel) => "routeId" in vessel && vessel.routeId === routeId,
  );
}

describe("VESSELS_SEED", () => {
  it("berisi 66 kapal", () => {
    expect(VESSELS_SEED).toHaveLength(66);
  });

  it("jumlah kapal per kelas cocok dengan daftar armada cp-pdf hal. 04", () => {
    for (const [slug, count] of Object.entries(EXPECTED_COUNT_BY_SLUG)) {
      expect(vesselsByClass(slug), slug).toHaveLength(count);
    }
  });

  it("setiap classSlug merujuk kelas yang ada di FLEET_CLASSES_SEED", () => {
    const knownSlugs = new Set(FLEET_CLASSES_SEED.map((c) => c.slug));
    for (const vessel of VESSELS_SEED) {
      expect(knownSlugs.has(vessel.classSlug), vessel.name).toBe(true);
    }
  });

  it("hanya kapal ro-ro-ferry yang punya routeId", () => {
    for (const vessel of VESSELS_SEED) {
      if ("routeId" in vessel) {
        expect(vessel.classSlug, vessel.name).toBe("ro-ro-ferry");
      }
    }
  });

  it("setiap routeId merujuk lintasan yang ada di ROUTE_LEGS", () => {
    const knownRoutes = new Set(ROUTE_LEGS.map((leg) => leg.id));
    for (const vessel of VESSELS_SEED) {
      if ("routeId" in vessel && vessel.routeId) {
        expect(knownRoutes.has(vessel.routeId), vessel.name).toBe(true);
      }
    }
  });

  it("setiap lintasan di ROUTE_LEGS punya minimal satu kapal", () => {
    for (const leg of ROUTE_LEGS) {
      expect(vesselsByRoute(leg.id).length, leg.id).toBeGreaterThan(0);
    }
  });

  it("tidak ada nama kapal duplikat", () => {
    const names = VESSELS_SEED.map((vessel) => vessel.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("tidak ada nama kapal yang kebetulan memuat teks tagline", () => {
    for (const vessel of VESSELS_SEED) {
      expect(vessel.name).not.toMatch(/zero|hero|continuous|improvement/i);
    }
  });
});
