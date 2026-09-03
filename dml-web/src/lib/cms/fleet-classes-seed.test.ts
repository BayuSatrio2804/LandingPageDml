import { describe, expect, it } from "vitest";
import { FLEET_CLASSES_SEED } from "./fleet-classes-seed";

describe("FLEET_CLASSES_SEED", () => {
  it("berisi lima kelas dengan slug unik", () => {
    expect(FLEET_CLASSES_SEED).toHaveLength(5);
    expect(new Set(FLEET_CLASSES_SEED.map((c) => c.slug)).size).toBe(5);
  });

  it("panjang dan lebar tiap kelas positif", () => {
    for (const fleetClass of FLEET_CLASSES_SEED) {
      expect(fleetClass.lengthMeters).toBeGreaterThan(0);
      expect(fleetClass.beamMeters).toBeGreaterThan(0);
    }
  });

  // Ro-Ro Ferry satu-satunya kelas penumpang, jadi satu-satunya yang tidak
  // punya DWT dan satu-satunya yang punya passengerCapacity.
  it("hanya ro-ro-ferry yang punya passengerCapacity dan tidak punya dwt", () => {
    for (const fleetClass of FLEET_CLASSES_SEED) {
      if (fleetClass.slug === "ro-ro-ferry") {
        expect(fleetClass.dwt).toBeNull();
        expect(fleetClass.passengerCapacity).not.toBeNull();
      } else {
        expect(fleetClass.dwt).not.toBeNull();
        expect(fleetClass.passengerCapacity).toBeNull();
      }
    }
  });

  it("altText tiap kelas menyebut blueprint skematik", () => {
    for (const fleetClass of FLEET_CLASSES_SEED) {
      expect(fleetClass.altText.toLowerCase()).toContain("blueprint skematik");
    }
  });

  it("order tiap kelas unik dan berurut", () => {
    const orders = FLEET_CLASSES_SEED.map((c) => c.order).sort((a, b) => a - b);
    expect(orders).toEqual([1, 2, 3, 4, 5]);
  });
});
