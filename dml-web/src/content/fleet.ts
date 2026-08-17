import type { FleetClass } from "./types";

/**
 * Lima kelas dipakai fleet comparator 3D (spec bagian 7.4). Panjang dan
 * kapasitas kelas Motor Tanker, Oil Barge, SPOB, Tugboat adalah estimasi
 * proporsional dari kategori kapasitas liter yang sudah tersitasi di
 * docs/superpowers/specs/2026-08-16-dml-corporate-design.md bagian 2, karena
 * belum ada sumber publik yang merinci dimensi per kelas. DWT per kelas
 * adalah pembagian proporsional dari total armada (40.546 DWT, 15 kapal),
 * bukan angka yang tersitasi langsung. Kelas Ro-Ro Ferry memakai data real
 * dari spec yang sama (Jambo VIII/X, 68 m, sekitar 400 penumpang).
 * Wajib dikonfirmasi klien sebelum situs live.
 *
 * Riset tambahan (17 Agustus 2026): ditemukan data dimensi kapal yang
 * dibangun PT Dutabahari Menara Line Dockyard (ptdml.com/v2/projects.htm)
 * untuk kelas Tug Boat, Oil Tanker, dan Self Propeller Oil Barge, serta studi
 * akademik SPOB 3500 DWT yang bersumber dari data DMLD (Wulandari & Ikhwani,
 * "Collision Analysis of a Self Propelled Oil Barge's (SPOB) Using Finite
 * Element Method", Kapal: Jurnal Ilmu Pengetahuan dan Teknologi Kelautan).
 * Tidak dipakai di sini karena kapal-kapal tersebut tercatat milik klien
 * eksternal galangan (PT Masada Jaya Lines, PT Lintas Samudera Borneo, PT
 * Sinar Alam Duta Perdana), bukan armada Lini 1 PT Dutabahari Menara Line
 * sendiri yang dideskripsikan di spec. Estimasi proporsional di bawah
 * dipertahankan sampai ada sumber yang secara eksplisit merujuk armada
 * milik PT Dutabahari Menara Line.
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
    altText: "Blueprint skematik KMP Jambo X, ferry ro-ro penumpang",
  },
];
