/**
 * Menghitung tahun penuh, bukan selisih tahun kalender: perusahaan berdiri 30
 * November, jadi sepanjang Januari sampai November angkanya masih tahun
 * sebelumnya. Selisih getFullYear saja akan menaikkannya sepuluh bulan lebih
 * awal.
 *
 * Dipindah ke lib/ di Plan 5 karena dua komponen memakainya (seksi Sejak 1988
 * dan band metrik), dan mengimpor fungsi murni dari sebuah komponen berarti
 * pengujiannya ikut menyeret React ke dalam berkas tes yang tidak perlu.
 */
export function yearsOperating(foundedIso: string, now: Date): number {
  const founded = new Date(foundedIso);
  let years = now.getUTCFullYear() - founded.getUTCFullYear();
  const monthDelta = now.getUTCMonth() - founded.getUTCMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getUTCDate() < founded.getUTCDate())) {
    years -= 1;
  }
  return years;
}
