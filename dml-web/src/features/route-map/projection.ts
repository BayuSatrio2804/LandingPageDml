export type LatLon = { lat: number; lon: number };
export type Point = { x: number; y: number };
export type MapBounds = { minLon: number; maxLon: number; minLat: number; maxLat: number };

/**
 * Kotak yang memuat seluruh jaringan ro-ro plus kantor pusat Banjarmasin,
 * dengan sisa ruang secukupnya supaya label pelabuhan tidak terpotong tepi.
 */
export const MAP_BOUNDS: MapBounds = {
  minLon: 109,
  maxLon: 118,
  minLat: -10,
  maxLat: -1,
};

export const VIEWBOX = { width: 1000, height: 620 } as const;

/**
 * Mercator hanya perlu diterapkan pada sumbu lintang; bujur linear apa adanya.
 * Tanpa ini, jarak Kumai ke Surabaya akan terlihat lebih pendek dari
 * seharusnya relatif terhadap jarak Ketapang ke Lembar, dan seluruh gunanya
 * memakai koordinat asli hilang.
 */
export function mercatorY(lat: number): number {
  const clamped = Math.min(85, Math.max(-85, lat));
  const rad = (clamped * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
}

export function project({ lat, lon }: LatLon): Point {
  const top = mercatorY(MAP_BOUNDS.maxLat);
  const bottom = mercatorY(MAP_BOUNDS.minLat);
  const x = ((lon - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon)) * VIEWBOX.width;
  const y = ((top - mercatorY(lat)) / (top - bottom)) * VIEWBOX.height;
  return { x, y };
}
