/**
 * Zona waktu dipaku ke UTC, bukan zona mesin. Tanpa itu artikel yang terbit
 * pada 00:30 WIB akan tampil bertanggal sehari lebih awal di server yang
 * berjalan di UTC, dan tanggal di kartu tidak lagi cocok dengan tanggal di
 * halaman detail kalau keduanya dirender di proses yang berbeda.
 */
const FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatTanggal(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return FORMATTER.format(date);
}
