import { describe, expect, it } from "vitest";
import { MAP_BOUNDS, VIEWBOX, mercatorY, project } from "./projection";

describe("mercatorY", () => {
  it("khatulistiwa jadi nol", () => {
    expect(mercatorY(0)).toBeCloseTo(0, 10);
  });

  it("simetris terhadap khatulistiwa", () => {
    expect(mercatorY(-8.145)).toBeCloseTo(-mercatorY(8.145), 10);
  });

  it("monoton naik terhadap lintang", () => {
    expect(mercatorY(10)).toBeGreaterThan(mercatorY(5));
    expect(mercatorY(-2)).toBeGreaterThan(mercatorY(-9));
  });
});

describe("project", () => {
  it("sudut barat laut bbox jadi titik asal viewBox", () => {
    const p = project({ lat: MAP_BOUNDS.maxLat, lon: MAP_BOUNDS.minLon });
    expect(p.x).toBeCloseTo(0, 6);
    expect(p.y).toBeCloseTo(0, 6);
  });

  it("sudut tenggara bbox jadi sudut jauh viewBox", () => {
    const p = project({ lat: MAP_BOUNDS.minLat, lon: MAP_BOUNDS.maxLon });
    expect(p.x).toBeCloseTo(VIEWBOX.width, 6);
    expect(p.y).toBeCloseTo(VIEWBOX.height, 6);
  });

  // Lintang lebih utara harus menghasilkan y lebih kecil. SVG menaruh y=0 di
  // atas, sedangkan Mercator menaruh lintang besar di atas, jadi sumbunya
  // memang harus dibalik. Test ini yang menangkap kalau pembalikan itu hilang.
  it("lintang lebih utara memberi y lebih kecil", () => {
    const utara = project({ lat: -2.74, lon: 111.73 });
    const selatan = project({ lat: -8.725, lon: 111.73 });
    expect(utara.y).toBeLessThan(selatan.y);
  });
});

describe("VIEWBOX", () => {
  /**
   * Skala x dan y harus sama. Versi Plan 4 memaku tinggi viewBox ke 620 untuk
   * bbox yang sebenarnya butuh sekitar 1006, jadi peta dipipihkan vertikal
   * hampir 40 persen: Kalimantan tampak gepeng dan sudut tiap leg rute salah.
   * Tes ini yang menahannya kalau MAP_BOUNDS diubah lagi tanpa menghitung
   * ulang tingginya.
   */
  it("menjaga skala derajat per piksel sama di kedua sumbu", () => {
    const lonSpanRad = ((MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon) * Math.PI) / 180;
    const latSpan = mercatorY(MAP_BOUNDS.maxLat) - mercatorY(MAP_BOUNDS.minLat);
    const xScale = VIEWBOX.width / lonSpanRad;
    const yScale = VIEWBOX.height / latSpan;
    expect(yScale / xScale).toBeCloseTo(1, 2);
  });
});
