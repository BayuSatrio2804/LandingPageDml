import type { Vessel } from "./types";

/**
 * Daftar 66 kapal bernama dari company profile resmi `assets/CP DML.pdf`
 * halaman 04. Sebelum plan ini, nama-nama ini cuma hidup sebagai komentar di
 * fleet.ts untuk dua kelas saja.
 *
 * SELISIH ANGKA, sekarang bisa ditunjuk persis. Daftar pengangkut BBM di
 * halaman itu berisi 57 kapal (7 MT + 11 TB + 9 OB + 30 SPOB), sedangkan
 * ringkasan di halaman yang sama menulis 55. Ro-ro cocok di angka 9. Jadi
 * seluruh selisih dua kapal ada di sisi BBM, bukan tersebar.
 * `COMPANY.fleetSummary` tetap memakai angka ringkasan PDF, dan tidak ada satu
 * pun tempat di situs yang menjumlahkan daftar ini lalu menampilkannya
 * bersebelahan dengan angka ringkasan. Termasuk butir konfirmasi klien.
 *
 * `OB Sahoya 0` tampak terpotong di PDF dan disalin apa adanya, ditandai
 * belum-terverifikasi, tidak ditebak jadi "Sahoya 04".
 */
export const VESSELS: Vessel[] = [
  // Ro-Ro, dikelompokkan per lintasan persis seperti di PDF.
  { name: "KMP Jambo VI", classSlug: "ro-ro-ferry", routeId: "ketapang-gilimanuk", source: "cp-pdf" },
  { name: "KMP Jambo VIII", classSlug: "ro-ro-ferry", routeId: "ketapang-gilimanuk", source: "cp-pdf" },
  { name: "KMP Jambo IX", classSlug: "ro-ro-ferry", routeId: "ketapang-gilimanuk", source: "cp-pdf" },
  { name: "KMP Jambo X", classSlug: "ro-ro-ferry", routeId: "ketapang-gilimanuk", source: "cp-pdf" },
  { name: "KMP BSP 1", classSlug: "ro-ro-ferry", routeId: "merak-bakauheni", source: "cp-pdf" },
  { name: "KMP Salvatore", classSlug: "ro-ro-ferry", routeId: "merak-bakauheni", source: "cp-pdf" },
  { name: "KMP Jambo XII", classSlug: "ro-ro-ferry", routeId: "jangkar-lembar", source: "cp-pdf" },
  { name: "KMP Jambo XIV", classSlug: "ro-ro-ferry", routeId: "kumai-perak", source: "cp-pdf" },
  { name: "KMP Jambo XI", classSlug: "ro-ro-ferry", routeId: "perak-lembar", source: "cp-pdf" },

  // Motor Tanker
  { name: "MT Royalty", classSlug: "motor-tanker", source: "cp-pdf" },
  { name: "MT Jazeel", classSlug: "motor-tanker", source: "cp-pdf" },
  { name: "MT AS Marine Satu", classSlug: "motor-tanker", source: "cp-pdf" },
  { name: "MT Gonaya VIII", classSlug: "motor-tanker", source: "cp-pdf" },
  { name: "MT Jefferson", classSlug: "motor-tanker", source: "cp-pdf" },
  { name: "MT Winston 01", classSlug: "motor-tanker", source: "cp-pdf" },
  { name: "MT Ocean River", classSlug: "motor-tanker", source: "cp-pdf" },

  // Oil Barge
  { name: "OB Wapoga", classSlug: "oil-barge", source: "cp-pdf" },
  { name: "OB Rani 68", classSlug: "oil-barge", source: "cp-pdf" },
  { name: "OB Fery 04", classSlug: "oil-barge", source: "cp-pdf" },
  { name: "OB Sahoya 05", classSlug: "oil-barge", source: "cp-pdf" },
  { name: "OB Megapower XI", classSlug: "oil-barge", source: "cp-pdf" },
  { name: "OB TS 005", classSlug: "oil-barge", source: "cp-pdf" },
  { name: "OB Sahoya 03", classSlug: "oil-barge", source: "cp-pdf" },
  // Nama ini terbaca terpotong di PDF, disalin apa adanya. Jangan ditebak.
  { name: "OB Sahoya 0", classSlug: "oil-barge", source: "belum-terverifikasi" },
  { name: "OB Utama 18", classSlug: "oil-barge", source: "cp-pdf" },

  // SPOB
  { name: "SPOB Fery IX", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Fery VI", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Hendra 001", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB SADP XX", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Palangkaraya", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Fery 01", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Fery XIV", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Jambo V", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Adeline 05", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Adeline 03", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Gonaya III", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Adeline 01", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB CISM 01", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Gonaya XV", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Sumberjaya V", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB DMLD 01", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Fery XVIII", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Sumber Jaya XVII", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Citra S4002", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Fery XXIII", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Najehah", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Bakut", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Berkah 8", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Fery XXX", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Gonaya IX", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Fery VIII", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Fery XVII", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Sumber Jaya XII", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Adeline 06", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB United X", classSlug: "spob", source: "cp-pdf" },

  // Tug Boat
  { name: "TB Bina Karya", classSlug: "tugboat", source: "cp-pdf" },
  { name: "TB DML 08", classSlug: "tugboat", source: "cp-pdf" },
  { name: "TB Albert", classSlug: "tugboat", source: "cp-pdf" },
  { name: "TB Fawwaz", classSlug: "tugboat", source: "cp-pdf" },
  { name: "TB Fery XX", classSlug: "tugboat", source: "cp-pdf" },
  { name: "TB Gonaya IV", classSlug: "tugboat", source: "cp-pdf" },
  { name: "TB Prioritas", classSlug: "tugboat", source: "cp-pdf" },
  { name: "TB Setia Kawan 27", classSlug: "tugboat", source: "cp-pdf" },
  { name: "TB Arya Candra", classSlug: "tugboat", source: "cp-pdf" },
  { name: "TB Sahoya 02", classSlug: "tugboat", source: "cp-pdf" },
  { name: "TB Teluk Sungkun 08", classSlug: "tugboat", source: "cp-pdf" },
];

export function vesselsByClass(classSlug: string): Vessel[] {
  return VESSELS.filter((vessel) => vessel.classSlug === classSlug);
}

export function vesselsByRoute(routeId: string): Vessel[] {
  return VESSELS.filter((vessel) => vessel.routeId === routeId);
}
