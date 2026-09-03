/**
 * Nilai default untuk global Payload `company-profile` dan `site-navigation`,
 * dipakai `scripts/seed.ts` untuk mengisi DB pertama kali.
 *
 * INI SATU-SATUNYA SUMBER LITERAL untuk data ini sejak profil perusahaan
 * pindah ke CMS. `src/content/company.ts` (dipertahankan hanya karena
 * `about.ts` masih memakai `GROUP_UNITS`/`COMPANY` — di luar cakupan fase
 * CMS ini) meng-impor balik dari sini, BUKAN sebaliknya, supaya tidak ada
 * dua tempat yang sama-sama kelihatan otoritatif.
 *
 * Sumber fakta aslinya: company profile resmi klien, `assets/CP DML.pdf`
 * (6 halaman, dibuat 5 Agustus 2026). Tiga koreksi terbesarnya:
 * 1. Tahun berdiri 1988, bukan 1985.
 * 2. Armada 64 kapal (9 ro-ro, 55 pengangkut BBM), bukan 15 kapal.
 * 3. Kantor pusat DML sendiri ada di Jl. AES Nasution 43, bukan Jl. Kapten
 *    Piere Tendean 174 (itu kantor pusat grup Sinar Alam).
 *
 * Begitu admin menyunting company-profile/site-navigation lewat /admin,
 * nilai di sini TIDAK LAGI dipakai — seed hanya mengisi kalau global belum
 * pernah disimpan (`!doc.createdAt`), persis pola articles-page.
 */

export const COMPANY_PROFILE_SEED = {
  legalName: "PT Dutabahari Menara Line",
  shortName: "Dutabahari Menara Line",
  abbreviation: "DML",
  tagline: "From Zero to Hero with Continuous Improvement", // cp-pdf hal. 01 dan 04
  foundedIso: "1988-11-30", // cp-pdf hal. 01
  founder: "Herman Chandra", // cp-pdf hal. 02
  parent: "Sinar Alam Corporation", // cp-pdf hal. 01
  phone: "+625116773845", // cp-pdf hal. 06, kantor pusat DML Banjarmasin
  whatsapp: "625116773845", // format E.164 tanpa tanda plus untuk wa.me
  bookingUrl: "https://dutabahari.id",
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
      key: "D" as const,
      term: "Dinamis",
      description: "Gesit dan mudah menyesuaikan diri terhadap perubahan dan tantangan yang muncul di lapangan.",
    },
    {
      key: "M" as const,
      term: "Terukur",
      description: "Menetapkan target pertumbuhan dan kinerja yang jelas, sehingga hasil kerja bisa dinilai dengan angka.",
    },
    {
      key: "L" as const,
      term: "Setia",
      description: "Membangun hubungan jangka panjang dengan pelanggan, karyawan, dan mitra usaha.",
    },
  ],
  standards: [
    {
      label: "Sistem manajemen",
      items: [
        { name: "ISO 9001:2015", source: "cp-pdf" as const },
        { name: "ISM Code", source: "cp-pdf" as const },
        { name: "ISPS Code", source: "riset-publik" as const },
        { name: "SIRE", source: "riset-publik" as const },
      ],
    },
    {
      label: "Biro klasifikasi",
      items: [{ name: "Biro Klasifikasi Indonesia (BKI)", source: "cp-pdf" as const }],
    },
    {
      label: "Sistem informasi",
      items: [{ name: "SAP", source: "cp-pdf" as const }],
    },
  ],
  memberships: [
    { name: "Sinar Alam Corporation" },
    { name: "OCIMF", expansion: "Forum maritim perusahaan minyak internasional" },
    {
      name: "GAPASDAP",
      expansion: "Gabungan Pengusaha Nasional Angkutan Sungai, Danau, dan Penyeberangan",
    },
    { name: "IMO", expansion: "Organisasi maritim internasional" },
  ],
  fleetSummary: {
    vessels: 64, // cp-pdf hal. 02 dan 04
    passengerVessels: 9, // cp-pdf hal. 04
    oilTransportVessels: 55, // cp-pdf hal. 04
    people: 300, // cp-pdf hal. 02, ditulis ">300"
  },
  // Kantor grup, dipisah dari offices supaya footer dan halaman kontak
  // tidak pernah mengirim orang ke alamat yang bukan alamat DML.
  groupOffices: [
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
  ],
  // Peta grup induk, cp-pdf hal. 01. Dipakai halaman Tentang Kami.
  groupUnits: [
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
  ],
};

/**
 * `navigation.ts` dulu pernah menaut ke `/tentang-kami#silsilah` dan
 * `#profil` — dua anchor id yang sudah tidak ada sejak halaman Tentang Kami
 * diganti total (seksi sekarang: jati-diri, nilai, struktur, legal, kantor).
 * Diperbaiki di sini: "Silsilah" -> #jati-diri (Tonggak pendirian ada di
 * situ), "Company Profile" -> #legal.
 */
export const SITE_NAVIGATION_SEED = {
  navItems: [
    { label: "Tentang Kami", href: "/tentang-kami" },
    { label: "Bisnis Kami", href: "/bisnis" },
    { label: "Karier", href: "/karier" },
    { label: "Artikel", href: "/artikel" },
    { label: "Kontak", href: "/kontak" },
    { label: "BookJambo", href: "https://dutabahari.id", external: true },
  ],
  footerGroups: [
    {
      heading: "Bisnis",
      items: [
        { label: "Transportasi BBM", href: "/bisnis/transportasi-bbm" },
        { label: "Penumpang Ro-Ro", href: "/bisnis/penumpang-roro" },
      ],
    },
    {
      heading: "Perusahaan",
      items: [
        { label: "Silsilah", href: "/tentang-kami#jati-diri" },
        { label: "Company Profile", href: "/tentang-kami#legal" },
        { label: "Karier", href: "/karier" },
      ],
    },
    {
      heading: "Layanan",
      items: [
        { label: "Pesan Tiket Ro-Ro", href: "https://dutabahari.id", external: true },
        {
          label: "Permintaan Informasi Bisnis",
          href: "/bisnis/transportasi-bbm/permintaan-informasi",
        },
        { label: "Kontak", href: "/kontak" },
      ],
    },
  ],
};
