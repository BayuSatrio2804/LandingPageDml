import { describe, expect, it } from "vitest";
import { DML_SERVED_PORT_IDS, PORTS, ROUTE_LEGS } from "./ports";
import { MAP_BOUNDS } from "./projection";

describe("PORTS", () => {
  it("setiap id unik", () => {
    expect(new Set(PORTS.map((p) => p.id)).size).toBe(PORTS.length);
  });

  it("tepat satu kantor, sisanya pelabuhan", () => {
    expect(PORTS.filter((p) => p.kind === "kantor")).toHaveLength(1);
    expect(PORTS.filter((p) => p.kind === "pelabuhan").length).toBe(PORTS.length - 1);
  });

  // Bbox peta melebar ke barat di Plan 5 untuk memuat Selat Sunda. Kalau ada
  // pelabuhan yang jatuh di luar kotak, ia digambar di luar viewBox dan hilang
  // tanpa error.
  it("setiap koordinat berada di dalam bbox peta", () => {
    for (const port of PORTS) {
      expect(port.lon).toBeGreaterThanOrEqual(MAP_BOUNDS.minLon);
      expect(port.lon).toBeLessThanOrEqual(MAP_BOUNDS.maxLon);
      expect(port.lat).toBeGreaterThanOrEqual(MAP_BOUNDS.minLat);
      expect(port.lat).toBeLessThanOrEqual(MAP_BOUNDS.maxLat);
    }
  });

  // Ketapang yang dimaksud adalah Banyuwangi, Jawa Timur, bukan Ketapang,
  // Kalimantan Barat yang ada di lintang sekitar -1,8.
  it("Ketapang berada di Jawa Timur, bukan Kalimantan Barat", () => {
    expect(PORTS.find((p) => p.id === "ketapang")?.lat).toBeLessThan(-7);
  });
});

describe("ROUTE_LEGS", () => {
  it("memuat kelima lintasan company profile", () => {
    expect(ROUTE_LEGS).toHaveLength(5);
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

  // Halaman 03 company profile menaruh Merak-Bakauheni di bawah PT Tri Sumaja
  // Lines, bukan di bawah DML. Kalau operator ini hilang, situs mengklaim
  // lintasan milik perusahaan lain sebagai lintasannya sendiri.
  it("Merak-Bakauheni dicatat sebagai lintasan afiliasi", () => {
    expect(ROUTE_LEGS.find((leg) => leg.id === "merak-bakauheni")?.operator).toBe("tsl");
  });
});

describe("DML_SERVED_PORT_IDS", () => {
  it("hanya memuat pelabuhan dari lintasan yang dioperasikan DML sendiri", () => {
    expect(DML_SERVED_PORT_IDS).not.toContain("merak");
    expect(DML_SERVED_PORT_IDS).not.toContain("bakauheni");
    expect(DML_SERVED_PORT_IDS).toContain("kumai");
  });

  it("tidak memuat kantor, dan tidak ada duplikat", () => {
    expect(DML_SERVED_PORT_IDS).not.toContain("banjarmasin");
    expect(new Set(DML_SERVED_PORT_IDS).size).toBe(DML_SERVED_PORT_IDS.length);
  });
});
