import { describe, expect, it } from "vitest";
import { PORTS, ROUTE_LEGS } from "./ports";
import { MAP_BOUNDS } from "./projection";

describe("PORTS", () => {
  it("punya empat pelabuhan dan satu kantor", () => {
    expect(PORTS.filter((p) => p.kind === "pelabuhan")).toHaveLength(4);
    expect(PORTS.filter((p) => p.kind === "kantor")).toHaveLength(1);
  });

  it("setiap id unik", () => {
    expect(new Set(PORTS.map((p) => p.id)).size).toBe(PORTS.length);
  });

  it("setiap koordinat berada di dalam bbox peta", () => {
    for (const port of PORTS) {
      expect(port.lon).toBeGreaterThanOrEqual(MAP_BOUNDS.minLon);
      expect(port.lon).toBeLessThanOrEqual(MAP_BOUNDS.maxLon);
      expect(port.lat).toBeGreaterThanOrEqual(MAP_BOUNDS.minLat);
      expect(port.lat).toBeLessThanOrEqual(MAP_BOUNDS.maxLat);
    }
  });

  // Ketapang yang dimaksud adalah Banyuwangi, Jawa Timur, bukan Ketapang,
  // Kalimantan Barat. Disimpulkan dari pasangan rutenya ke Lembar di master
  // spec bagian 2. Ketapang Kalbar ada di lintang sekitar -1,8; kalau angka
  // itu yang masuk, test ini gagal.
  it("Ketapang berada di Jawa Timur, bukan Kalimantan Barat", () => {
    const ketapang = PORTS.find((p) => p.id === "ketapang");
    expect(ketapang?.lat).toBeLessThan(-7);
  });
});

describe("ROUTE_LEGS", () => {
  it("punya tiga leg terpisah, bukan satu rantai", () => {
    expect(ROUTE_LEGS).toHaveLength(3);
  });

  it("setiap ujung leg merujuk id pelabuhan yang ada", () => {
    const ids = new Set(PORTS.filter((p) => p.kind === "pelabuhan").map((p) => p.id));
    for (const leg of ROUTE_LEGS) {
      expect(ids.has(leg.fromId)).toBe(true);
      expect(ids.has(leg.toId)).toBe(true);
    }
  });

  it("tidak ada leg yang berujung di dirinya sendiri", () => {
    for (const leg of ROUTE_LEGS) {
      expect(leg.fromId).not.toBe(leg.toId);
    }
  });
});
