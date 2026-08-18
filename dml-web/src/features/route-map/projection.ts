export type LatLon = { lat: number; lon: number };
export type Point = { x: number; y: number };
export type MapBounds = { minLon: number; maxLon: number; minLat: number; maxLat: number };

/**
 * Kotak yang memuat kelima lintasan ro-ro company profile (`assets/CP DML.pdf`
 * hal. 03 dan 04) plus kantor pusat Banjarmasin. Batas barat harus menampung
 * Merak dan Bakauheni di Selat Sunda, yang tidak ada di versi Plan 4, dan
 * batas timur harus menyisakan ruang untuk label Lembar di sisi kanan.
 *
 * Labuan Bajo sengaja di luar kotak. Wisata bahari di sana dijalankan PT Duta
 * Wisata Bahari, bukan lintasan penyeberangan DML, dan memasukkannya akan
 * menggandakan lebar peta demi satu titik yang bukan rute ro-ro.
 */
export const MAP_BOUNDS: MapBounds = {
  minLon: 104.5,
  maxLon: 119,
  minLat: -10,
  maxLat: -1.5,
};

/**
 * Mercator hanya perlu diterapkan pada sumbu lintang; bujur linear apa adanya.
 * Tanpa ini, jarak Kumai ke Surabaya akan terlihat lebih pendek dari
 * seharusnya relatif terhadap jarak Ketapang ke Gilimanuk, dan seluruh gunanya
 * memakai koordinat asli hilang.
 */
export function mercatorY(lat: number): number {
  const clamped = Math.min(85, Math.max(-85, lat));
  const rad = (clamped * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
}

const VIEWBOX_WIDTH = 1000;

/**
 * Tinggi viewBox diturunkan dari bbox, tidak dipatok tangan. Versi Plan 4
 * memakai 1000x620 untuk bbox 9 derajat x 9 derajat, yang berarti peta
 * dipipihkan vertikal sekitar 38 persen: Kalimantan tampak gepeng dan sudut
 * setiap leg rute salah. Rumus di bawah menjaga skala x dan y identik, jadi
 * bentuk pulau dan arah lintasan ikut benar dengan sendirinya setiap kali
 * MAP_BOUNDS diubah.
 */
const LON_SPAN_RAD = ((MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon) * Math.PI) / 180;
const LAT_SPAN_MERCATOR = mercatorY(MAP_BOUNDS.maxLat) - mercatorY(MAP_BOUNDS.minLat);

export const VIEWBOX = {
  width: VIEWBOX_WIDTH,
  height: Math.round((VIEWBOX_WIDTH * LAT_SPAN_MERCATOR) / LON_SPAN_RAD),
} as const;

export function project({ lat, lon }: LatLon): Point {
  const top = mercatorY(MAP_BOUNDS.maxLat);
  const bottom = mercatorY(MAP_BOUNDS.minLat);
  const x = ((lon - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon)) * VIEWBOX.width;
  const y = ((top - mercatorY(lat)) / (top - bottom)) * VIEWBOX.height;
  return { x, y };
}
