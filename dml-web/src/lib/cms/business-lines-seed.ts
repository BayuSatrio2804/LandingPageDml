/**
 * Nilai default koleksi Payload `business-lines`, dipakai scripts/seed.ts.
 * Satu-satunya sumber literal sejak lini bisnis & afiliasi pindah ke CMS —
 * src/content/business-lines.ts sudah dihapus.
 *
 * Struktur mengikuti company profile resmi hal. 03: dua lini utama yang
 * dijalankan PT Dutabahari Menara Line sendiri, lalu tiga afiliasi di
 * dalam Sinar Alam Corporation (bukan lini DML — rute Merak-Bakauheni
 * dioperasikan Tri Sumaja Lines, jangan diklaim dengan kalimat yang sama
 * dengan rute yang dijalankan DML).
 */
export const BUSINESS_LINES_SEED = [
  {
    slug: "transportasi-bbm",
    kind: "lini-utama" as const,
    number: "01",
    title: "Transportasi BBM",
    operator: "Dijalankan langsung oleh PT Dutabahari Menara Line",
    summary:
      "Distribusi bahan bakar cair ke pelabuhan dan pulau-pulau utama Indonesia, dari muat di terminal sampai serah di titik yang tidak terjangkau jetty konvensional.",
    bullets: [
      "Motor Tanker (MT) untuk muatan curah",
      "Self Propelled Oil Barge (SPOB)",
      "Oil Barge (OB)",
      "Tugboat (TB) pendamping",
    ],
    metric: { value: "55", label: "kapal pengangkut BBM" },
    mediaId: "transportasi-bbm",
    order: 0,
  },
  {
    slug: "penumpang-roro",
    kind: "lini-utama" as const,
    number: "02",
    title: "Penyeberangan Ro-Ro",
    operator: "Dijalankan langsung oleh PT Dutabahari Menara Line",
    summary:
      "Layanan penyeberangan penumpang dan kendaraan dengan jadwal tetap di lintasan yang menghubungkan Jawa, Bali, Lombok, dan Kalimantan Tengah.",
    bullets: ["Ketapang - Gilimanuk", "Surabaya - Lembar", "Surabaya - Kumai", "Jangkar - Lembar"],
    metric: { value: "9", label: "kapal ro-ro penumpang" },
    mediaId: "penumpang-roro",
    order: 1,
  },
  {
    slug: "tri-sumaja-lines",
    kind: "afiliasi" as const,
    number: "03",
    title: "PT Tri Sumaja Lines",
    operator: "Afiliasi",
    summary: "Mengoperasikan kapal penumpang untuk pelayaran domestik.",
    bullets: ["Merak - Bakauheni"],
    metric: null,
    mediaId: null,
    order: 2,
  },
  {
    slug: "duta-wisata-bahari",
    kind: "afiliasi" as const,
    number: "04",
    title: "PT Duta Wisata Bahari",
    operator: "Afiliasi",
    summary: "Kapal wisata untuk island hopping di Labuan Bajo.",
    bullets: ["Private boat charter", "Open trip"],
    metric: null,
    mediaId: null,
    order: 3,
  },
  {
    slug: "dutabahari-teknik",
    kind: "afiliasi" as const,
    number: "05",
    title: "Dutabahari Teknik",
    operator: "Afiliasi",
    summary: "Perbaikan dan perawatan kapal untuk armada DML sendiri maupun pihak ketiga.",
    bullets: ["Perbaikan lambung dan mesin", "Perawatan berkala"],
    metric: null,
    mediaId: null,
    order: 4,
  },
];
