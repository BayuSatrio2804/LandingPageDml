import { describe, expect, it } from "vitest";
import { fitCameraDistance } from "./fit-camera";

describe("fitCameraDistance", () => {
  it("jarak sebanding lurus dengan radius objek", () => {
    const kecil = fitCameraDistance(1, 45);
    const besar = fitCameraDistance(2, 45);
    expect(besar).toBeCloseTo(kecil * 2, 10);
  });

  // Ini inti perbaikan cacat audit bagian 2.1 nomor 6: kamera tetap di
  // [4, 2, 4] memotong lambung 95 m. Fov lebih lebar harus memberi jarak
  // lebih dekat untuk radius yang sama.
  it("fov lebih lebar memberi jarak lebih dekat", () => {
    expect(fitCameraDistance(1, 60)).toBeLessThan(fitCameraDistance(1, 30));
  });

  it("margin menambah jarak secara proporsional", () => {
    expect(fitCameraDistance(1, 45, 2)).toBeCloseTo(fitCameraDistance(1, 45, 1) * 2, 10);
  });

  it("radius nol memberi jarak nol, bukan NaN", () => {
    expect(fitCameraDistance(0, 45)).toBe(0);
  });
});
