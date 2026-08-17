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
