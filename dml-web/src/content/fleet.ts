import type { FleetClass } from "./types";

/**
 * Lima kelas dipakai fleet comparator 3D. Jumlah kapal per kelas
 * (`vesselCount`) berasal dari daftar armada company profile resmi
 * `assets/CP DML.pdf` halaman 04.
 *
 * PERINGATAN ANGKA, wajib dikonfirmasi klien: PDF menulis ringkasan 64 kapal
 * (09 ro-ro + 55 pengangkut BBM), tapi daftar nama kapal di halaman yang sama
 * memuat 9 ro-ro + 7 MT + 9 OB + 30 SPOB + 11 TB = 66. Selisih dua kapal ini
 * tidak dijembatani sendiri: COMPANY.fleetSummary memakai angka ringkasan PDF,
 * dan vesselCount di bawah memakai hasil hitung daftar. Tidak ada tempat di
 * situs yang menjumlahkan vesselCount, jadi kedua angka tidak pernah tampil
 * saling membantah.
 *
 * Panjang, lebar, dan DWT per kelas TIDAK ada di PDF. Semua angka dimensi di
 * bawah tetap estimasi proporsional dari kategori kapasitas liter di master
 * spec bagian 2, kecuali Ro-Ro Ferry yang memakai data Jambo VIII/X (68 m,
 * sekitar 400 penumpang). Semuanya masih bertanda unverified.
 *
 * Riset tambahan (17 Agustus 2026): ada data dimensi kapal bangunan PT
 * Dutabahari Menara Line Dockyard di ptdml.com untuk kelas Tug Boat, Oil
 * Tanker, dan SPOB, serta studi SPOB 3500 DWT (Wulandari & Ikhwani, Kapal:
 * Jurnal Ilmu Pengetahuan dan Teknologi Kelautan). Tidak dipakai karena
 * kapal-kapal itu milik klien eksternal galangan, bukan armada DML sendiri.
 */
export const FLEET_CLASSES: FleetClass[] = [
  {
    slug: "motor-tanker",
    name: "Motor Tanker",
    category: "Transportasi BBM",
    lengthMeters: 95, // unverified: estimasi proporsional dari kapasitas 8 juta liter
    beamMeters: 16, // unverified: estimasi proporsional
    dwt: 9500, // unverified: estimasi proporsional dari total armada
    capacityLabel: "hingga 8 juta liter",
    passengerCapacity: null,
    vesselCount: 7, // cp-pdf hal. 04: MT Royalty, Jazeel, AS Marine Satu, Gonaya VIII, Jefferson, Winston 01, Ocean River
    altText: "Blueprint skematik motor tanker, kelas terbesar armada BBM",
  },
  {
    slug: "oil-barge",
    name: "Oil Barge",
    category: "Transportasi BBM",
    lengthMeters: 75, // unverified: estimasi proporsional dari kapasitas 4,7 juta liter
    beamMeters: 14, // unverified: estimasi proporsional
    dwt: 5600, // unverified: estimasi proporsional dari total armada
    capacityLabel: "hingga 4,7 juta liter",
    passengerCapacity: null,
    vesselCount: 9, // cp-pdf hal. 04
    altText: "Blueprint skematik oil barge, ditarik tugboat pendamping",
  },
  {
    slug: "spob",
    name: "SPOB",
    category: "Transportasi BBM",
    lengthMeters: 55, // unverified: estimasi proporsional dari kapasitas 1,6 juta liter
    beamMeters: 11, // unverified: estimasi proporsional
    dwt: 1900, // unverified: estimasi proporsional dari total armada
    capacityLabel: "hingga 1,6 juta liter",
    passengerCapacity: null,
    vesselCount: 30, // cp-pdf hal. 04
    altText: "Blueprint skematik SPOB, kelas terkecil armada tanker",
  },
  {
    slug: "tugboat",
    name: "Tugboat",
    category: "Transportasi BBM",
    lengthMeters: 32, // unverified: estimasi umum tugboat pendamping oil barge
    beamMeters: 9, // unverified: estimasi umum
    dwt: 450, // unverified: estimasi proporsional dari total armada
    capacityLabel: "pendamping oil barge",
    passengerCapacity: null,
    vesselCount: 11, // cp-pdf hal. 04
    altText: "Blueprint skematik tugboat pendamping oil barge",
  },
  {
    slug: "ro-ro-ferry",
    name: "Ro-Ro Ferry (KMP Jambo X)",
    category: "Penumpang Ro-Ro",
    lengthMeters: 68, // spec: docs/superpowers/specs/2026-08-16-dml-corporate-design.md baris 49-50
    beamMeters: 17, // unverified: estimasi rasio umum ferry ro-ro sepanjang 68 m
    dwt: null,
    capacityLabel: "sekitar 400 penumpang",
    passengerCapacity: 400, // spec: docs/superpowers/specs/2026-08-16-dml-corporate-design.md baris 50
    // cp-pdf hal. 04 mendaftar sembilan kapal ro-ro di dalam armada DML: Jambo
    // VI, VIII, IX, X, XI, XII, XIV, KMP BSP 1, dan KMP Salvatore. Dua yang
    // terakhir melayani Merak-Bakauheni, yang di halaman 03 dioperasikan PT Tri
    // Sumaja Lines. PDF sendiri yang tidak konsisten di dua halamannya, dan
    // angka ringkasannya yang dipakai di sini. Termasuk butir konfirmasi klien.
    vesselCount: 9,
    altText: "Blueprint skematik KMP Jambo X, ferry ro-ro penumpang",
  },
];
