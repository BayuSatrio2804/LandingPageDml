/**
 * Jarak kamera supaya bola pembatas objek muat penuh di dalam frustum
 * vertikal. Tanpa ini, kamera bernilai tetap akan memotong kelas kapal
 * terpanjang dan menyisakan ruang kosong besar di kelas terpendek, yaitu
 * cacat yang diaudit di spec bagian 2.1 nomor 6.
 *
 * Fungsi murni tanpa impor three: radius dihitung pemanggil dari data kelas
 * kapal, sehingga aritmetika kamera bisa diuji tanpa WebGL sama sekali.
 */
export function fitCameraDistance(radius: number, fovDegrees: number, margin = 1.15): number {
  if (radius <= 0) return 0;
  const half = (fovDegrees * Math.PI) / 360;
  return (radius / Math.sin(half)) * margin;
}

export type BoxSize = { x: number; y: number; z: number };

/**
 * Jarak kamera supaya KOTAK pembatas objek muat penuh, memperhitungkan rasio
 * aspek kanvas.
 *
 * fitCameraDistance di atas memuat bola pembatas, dan bola yang mengelilingi
 * lambung kapal punya radius sebesar separuh panjangnya. Memuat radius itu ke
 * bukaan vertikal berarti kamera mundur seolah kapal setinggi ia panjang,
 * sehingga lambung yang panjang dan tipis tampil kecil dengan ruang kosong
 * besar di atas dan di bawahnya. Itu yang membuat "zoom sesuai ukuran kapal"
 * tidak pernah benar-benar terasa, dan kenapa versi Plan 4 perlu margin 1,5
 * untuk sekadar menghindari terpotong.
 *
 * Di sini bukaan horizontal dan vertikal dihitung terpisah, lalu diambil yang
 * lebih menuntut. Jejak XZ dipakai lewat diagonalnya, bukan lewat x saja,
 * karena kapal berputar terhadap sumbu Y: siluet terlebarnya adalah diagonal
 * jejak itu, dan memakai x saja akan memotong lambung setiap kali putaran
 * membawanya menyerong ke kamera.
 */
export function fitCameraDistanceForBox(
  size: BoxSize,
  fovDegrees: number,
  aspect: number,
  margin = 1.15,
): number {
  const halfVertical = Math.tan((fovDegrees * Math.PI) / 360);
  if (halfVertical <= 0 || aspect <= 0) return 0;
  const halfHorizontal = halfVertical * aspect;

  const footprint = Math.hypot(Math.max(0, size.x), Math.max(0, size.z)) / 2;
  const height = Math.max(0, size.y) / 2;
  if (footprint <= 0 && height <= 0) return 0;

  return Math.max(height / halfVertical, footprint / halfHorizontal) * margin;
}
