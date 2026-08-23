import { describe, expect, it } from "vitest";
import { VESSELS, vesselsByClass, vesselsByRoute } from "./vessels";
import { FLEET_CLASSES } from "./fleet";
import { ROUTE_LEGS } from "@/features/route-map/ports";

describe("VESSELS", () => {
  it("memuat 66 kapal, sesuai hitungan daftar PDF halaman 04", () => {
    expect(VESSELS).toHaveLength(66);
  });

  it("jumlah per kelas cocok dengan vesselCount di fleet.ts", () => {
    for (const fleetClass of FLEET_CLASSES) {
      expect(
        vesselsByClass(fleetClass.slug).length,
        `kelas ${fleetClass.slug}`,
      ).toBe(fleetClass.vesselCount);
    }
  });

  it("setiap classSlug menunjuk kelas yang benar-benar ada", () => {
    const known = new Set(FLEET_CLASSES.map((fleetClass) => fleetClass.slug));
    for (const vessel of VESSELS) {
      expect(known.has(vessel.classSlug), `kapal ${vessel.name}`).toBe(true);
    }
  });

  it("setiap routeId menunjuk lintasan yang benar-benar ada", () => {
    const known = new Set(ROUTE_LEGS.map((leg) => leg.id));
    for (const vessel of VESSELS) {
      if (!vessel.routeId) continue;
      expect(known.has(vessel.routeId), `kapal ${vessel.name}`).toBe(true);
    }
  });

  it("hanya kapal ro-ro yang punya routeId", () => {
    for (const vessel of VESSELS) {
      if (vessel.routeId) expect(vessel.classSlug).toBe("ro-ro-ferry");
    }
  });

  it("kelima lintasan punya minimal satu kapal", () => {
    for (const leg of ROUTE_LEGS) {
      expect(vesselsByRoute(leg.id).length, `lintasan ${leg.id}`).toBeGreaterThan(0);
    }
  });

  it("tidak ada nama duplikat", () => {
    const names = VESSELS.map((vessel) => vessel.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("tidak ada sisa teks tagline yang ikut terekstrak", () => {
    for (const vessel of VESSELS) {
      expect(vessel.name).not.toMatch(/zero|hero|continuous|improvement/i);
    }
  });
});
