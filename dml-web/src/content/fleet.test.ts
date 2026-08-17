import { describe, expect, it } from "vitest";
import { FLEET_CLASSES } from "./fleet";

describe("FLEET_CLASSES", () => {
  it("berisi tepat 5 kelas", () => {
    expect(FLEET_CLASSES).toHaveLength(5);
  });

  it("setiap kelas punya slug unik", () => {
    const slugs = FLEET_CLASSES.map((entry) => entry.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("panjang dan lebar setiap kelas positif", () => {
    for (const entry of FLEET_CLASSES) {
      expect(entry.lengthMeters).toBeGreaterThan(0);
      expect(entry.beamMeters).toBeGreaterThan(0);
    }
  });

  it("kelas ro-ro-ferry punya kapasitas penumpang, kelas kargo tidak", () => {
    const ferry = FLEET_CLASSES.find((entry) => entry.slug === "ro-ro-ferry");
    expect(ferry?.passengerCapacity).toBeGreaterThan(0);

    const cargoClasses = FLEET_CLASSES.filter((entry) => entry.slug !== "ro-ro-ferry");
    for (const entry of cargoClasses) {
      expect(entry.passengerCapacity).toBeNull();
    }
  });
});
