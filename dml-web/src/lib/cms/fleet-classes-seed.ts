/**
 * Nilai default koleksi Payload `fleet-classes`, dipakai scripts/seed.ts.
 * Satu-satunya sumber literal sejak kelas armada pindah ke CMS — src/content/
 * fleet.ts sudah dihapus.
 *
 * TIDAK ADA `vesselCount` di sini (beda dari fleet.ts lama): jumlah kapal per
 * kelas dihitung LIVE dari koleksi `vessels` oleh
 * src/lib/cms/fleet-classes.ts, supaya admin menambah/menghapus kapal lewat
 * /admin langsung tercermin tanpa developer ikut mengubah seed ini.
 *
 * Panjang, lebar, dan DWT per kelas TIDAK ada di company profile resmi.
 * Semua angka dimensi di bawah tetap estimasi proporsional dari kategori
 * kapasitas liter di master spec bagian 2, kecuali Ro-Ro Ferry yang memakai
 * data Jambo VIII/X (68 m, sekitar 400 penumpang). Semuanya masih bertanda
 * unverified.
 */
export const FLEET_CLASSES_SEED = [
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
    order: 1,
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
    order: 2,
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
    order: 3,
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
    order: 4,
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
    order: 5,
  },
];
