/**
 * Nilai default koleksi Payload `clients`, dipakai scripts/seed.ts untuk
 * mengisi DB pertama kali. Satu-satunya sumber literal sejak daftar klien
 * pindah ke CMS — src/content/clients.ts sudah dihapus.
 *
 * Sumber: daftar "Trusted by Leading Companies", company profile hal. 06.
 * DUA HAL YANG WAJIB DIJAGA:
 * Pertama, di PDF blok ini SATU raster gepeng — logonya tidak bisa dipisah
 * per merek, jadi berkas logo berasal dari aset yang dikirim pemilik
 * proyek (lihat scripts/seed.ts, folder Aset 4), bukan hasil memotong PDF.
 * Kedua, `sector` adalah bidang usaha klien, BUKAN pernyataan tentang isi
 * kontraknya dengan DML — nilai kontrak/durasi/lingkup kerja tidak ada di
 * sumber mana pun, jangan ditambahkan tanpa konfirmasi.
 */
export const CLIENTS_SEED = [
  {
    name: "Pertamina Patra Niaga",
    sector: "Energi",
    logoFile: "pertamina.png",
    source: "cp-pdf" as const,
    order: 0,
  },
  {
    name: "PetroMine Energy",
    sector: "Energi",
    logoFile: "petromine.webp",
    source: "cp-pdf" as const,
    order: 1,
  },
  {
    name: "Adaro Energy",
    sector: "Tambang",
    logoFile: "adaro.png",
    source: "cp-pdf" as const,
    order: 2,
  },
  {
    // unverified: berkas logo resmi belum tersedia, dirender sebagai teks.
    name: "AKR Corporindo",
    sector: "Distribusi BBM",
    logoFile: null,
    source: "cp-pdf" as const,
    order: 3,
  },
  {
    name: "Pama Persada Nusantara",
    sector: "Kontraktor tambang",
    logoFile: "pama.png",
    source: "cp-pdf" as const,
    order: 4,
  },
  {
    name: "Lintas Borneo",
    sector: "Pelayaran",
    logoFile: "lintas-borneo.jpg",
    source: "cp-pdf" as const,
    order: 5,
  },
];
