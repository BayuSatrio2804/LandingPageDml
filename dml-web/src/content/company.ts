import type { Company, GroupUnit, Office } from "./types";

/**
 * Sumber utama: company profile resmi klien, `assets/CP DML.pdf` (6 halaman,
 * dibuat 5 Agustus 2026). Sejak Plan 5, PDF itu yang menang atas riset publik
 * Plan 1 setiap kali keduanya berbeda. Tiga koreksi terbesarnya:
 *
 * 1. Tahun berdiri 1988, bukan 1985. Angka 1985 berasal dari halaman profil
 *    SinarAlam dan sudah terlanjur jadi judul seksi beranda serta metadata.
 * 2. Armada 64 kapal (9 ro-ro, 55 pengangkut BBM), bukan 15 kapal. Angka
 *    40.546 DWT tidak muncul di PDF sama sekali dan karena itu dihapus,
 *    bukan dipertahankan berdampingan.
 * 3. Kantor pusat DML sendiri ada di Jl. AES Nasution 43. Jl. Kapten Piere
 *    Tendean 174 adalah kantor pusat grup Sinar Alam di Banjarmasin, bukan
 *    kantor DML, dan sebelumnya salah dilabeli "Kantor Pusat" DML.
 *
 * Yang masih wajib dikonfirmasi klien tercatat di
 * docs/superpowers/specs/2026-08-18-dml-plan-5-profil-dan-beranda-design.md.
 */
export const COMPANY: Company = {
  legalName: "PT Dutabahari Menara Line",
  shortName: "Dutabahari Menara Line",
  abbreviation: "DML",
  tagline: "From Zero to Hero with Continuous Improvement", // cp-pdf hal. 01 dan 04, dikutip apa adanya dalam bahasa Inggris
  foundedIso: "1988-11-30", // cp-pdf hal. 01
  founder: "Herman Chandra", // cp-pdf hal. 02
  parent: "Sinar Alam Corporation", // cp-pdf hal. 01, dua kata
  phone: "+625116773845", // cp-pdf hal. 06, kantor pusat DML Banjarmasin
  whatsapp: "625116773845", // format E.164 tanpa tanda plus untuk wa.me
  offices: [
    {
      label: "Kantor Pusat DML",
      street: "Jl. AES Nasution 43",
      city: "Banjarmasin",
      postalCode: "70123",
      province: "Kalimantan Selatan",
      phone: "+62 511 6773845",
    },
    {
      label: "Kantor Cabang Banyuwangi",
      street: "Jl. Kalipuro, Ketapang",
      city: "Banyuwangi",
      province: "Jawa Timur",
    },
  ],
  values: [
    {
      key: "D",
      term: "Dynamic",
      description: "Gesit dan mudah menyesuaikan diri terhadap perubahan dan tantangan.",
    },
    {
      key: "M",
      term: "Measurable",
      description: "Menetapkan target pertumbuhan dan kinerja yang jelas dan terukur.",
    },
    {
      key: "L",
      term: "Loyalty",
      description: "Membangun hubungan jangka panjang dengan pelanggan, karyawan, dan mitra.",
    },
  ],
  /**
   * ISPS Code dan SIRE tidak muncul di PDF. Keduanya tidak dihapus diam-diam
   * karena berasal dari riset Plan 1 yang tercatat di master spec, tapi
   * ditandai `riset-publik` supaya klien bisa mencoret keduanya tanpa harus
   * menebak mana yang punya dasar dokumen.
   */
  standards: [
    {
      label: "Sistem manajemen",
      items: [
        { name: "ISO 9001:2015", source: "cp-pdf" }, // logo sertifikat DQS, hal. 01
        { name: "ISM Code", source: "cp-pdf" },
        { name: "ISPS Code", source: "riset-publik" },
        { name: "SIRE", source: "riset-publik" },
      ],
    },
    {
      label: "Biro klasifikasi",
      items: [{ name: "Biro Klasifikasi Indonesia (BKI)", source: "cp-pdf" }],
    },
    {
      label: "Sistem informasi",
      items: [{ name: "SAP", source: "cp-pdf" }],
    },
  ],
  memberships: [
    { name: "Sinar Alam Corporation" },
    { name: "OCIMF", expansion: "Oil Companies International Marine Forum" },
    {
      name: "GAPASDAP",
      expansion: "Gabungan Pengusaha Nasional Angkutan Sungai, Danau, dan Penyeberangan",
    },
    { name: "IMO", expansion: "International Maritime Organization" },
  ],
  fleetSummary: {
    vessels: 64, // cp-pdf hal. 02 dan 04
    passengerVessels: 9, // cp-pdf hal. 04
    oilTransportVessels: 55, // cp-pdf hal. 04
    people: 300, // cp-pdf hal. 02, ditulis ">300" jadi ditampilkan dengan awalan lebih dari
  },
};

/**
 * Kantor grup, dipisah dari COMPANY.offices supaya footer dan halaman kontak
 * tidak pernah mengirim orang ke alamat yang bukan alamat DML.
 */
export const GROUP_OFFICES: Office[] = [
  {
    label: "Sinar Alam Corporation, Jakarta",
    street: "Bakrie Tower Lantai 2, Rasuna Epicentrum, Jl. HR Rasuna Said",
    city: "Jakarta",
    postalCode: "12940",
    province: "DKI Jakarta",
    phone: "+62 21 29941876",
    fax: "+62 21 29941874",
  },
  {
    label: "Kantor Pusat Grup, Banjarmasin",
    street: "Jl. Kapten Piere Tendean 174",
    city: "Banjarmasin",
    postalCode: "70123",
    province: "Kalimantan Selatan",
    phone: "+62 511 3268280",
    fax: "+62 511 3268174",
  },
];

/**
 * Peta grup induk, cp-pdf hal. 01. Dipakai halaman Tentang Kami, bukan
 * beranda: beranda menjual jasa DML, bukan struktur holding.
 */
export const GROUP_UNITS: GroupUnit[] = [
  {
    sector: "Transportir",
    companies: [
      "PT Sinaralam Duta Perdana",
      "PT Masada Jaya Line",
      "PT Dutabahari Menara Line",
      "PT Tri Sumaja Lines",
    ],
  },
  { sector: "Keuangan", companies: ["PT Dana Permata Lestari"] },
  { sector: "Galangan Kapal", companies: ["PT Dutabahari Menara Line Dockyard"] },
  {
    sector: "Perdagangan BBM",
    companies: ["PT Sinaralam Duta Perdana II", "PT Kalianda Golden Bunker"],
  },
  {
    sector: "Properti dan Kontraktor",
    companies: [
      "PT Chandra Batuah Alam Lestari",
      "PT Chandra Batuah Mustika Lestari",
      "Kota Cinema Mall Belda",
      "Jumpa Square",
    ],
  },
  { sector: "Perkebunan", companies: ["PT Citra Putra Kebun Asri"] },
];
