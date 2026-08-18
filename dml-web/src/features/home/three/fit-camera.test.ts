import { describe, expect, it } from "vitest";
import { fitCameraDistance, fitCameraDistanceForBox } from "./fit-camera";

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

describe("fitCameraDistanceForBox", () => {
  it("mengembalikan nol untuk masukan yang tidak masuk akal", () => {
    expect(fitCameraDistanceForBox({ x: 0, y: 0, z: 0 }, 40, 1.5)).toBe(0);
    expect(fitCameraDistanceForBox({ x: 5, y: 1, z: 1 }, 40, 0)).toBe(0);
  });

  /**
   * Inti perbaikannya. Untuk lambung panjang dan tipis, memuat bola pembatas
   * menuntut jarak jauh lebih besar daripada memuat kotaknya, karena radius
   * bola sama dengan separuh panjang lambung. Selisih inilah yang dulu tampil
   * sebagai kapal kecil di tengah frame yang mayoritas kosong.
   */
  it("jauh lebih dekat daripada fit bola untuk lambung panjang dan tipis", () => {
    const size = { x: 9.5, y: 1.2, z: 1.6 };
    const sphereRadius = Math.hypot(size.x, size.y, size.z) / 2;
    const box = fitCameraDistanceForBox(size, 40, 1.6, 1.15);
    const sphere = fitCameraDistance(sphereRadius, 40, 1.15);
    expect(box).toBeGreaterThan(0);
    expect(box).toBeLessThan(sphere);
  });

  it("kanvas lebih sempit menuntut kamera lebih jauh", () => {
    const size = { x: 9.5, y: 1.2, z: 1.6 };
    expect(fitCameraDistanceForBox(size, 40, 0.8)).toBeGreaterThan(
      fitCameraDistanceForBox(size, 40, 1.6),
    );
  });

  // Kapal berputar terhadap sumbu Y, jadi siluet terlebarnya adalah diagonal
  // jejak XZ. Objek yang lebar di Z harus menuntut jarak yang sama dengan
  // objek yang sama lebarnya di X.
  it("memperlakukan panjang di X dan di Z setara", () => {
    expect(fitCameraDistanceForBox({ x: 9, y: 1, z: 2 }, 40, 1.5)).toBeCloseTo(
      fitCameraDistanceForBox({ x: 2, y: 1, z: 9 }, 40, 1.5),
      10,
    );
  });
});
