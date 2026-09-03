/**
 * Teks bawaan halaman /bisnis (landing lini bisnis). Angka armada, daftar
 * kapal, afiliasi, dan klien tetap dari koleksi CMS; di sini judul, kicker,
 * prosa, dan label panel.
 *
 * Fallback global `business-page` yang belum diseed + default prop komponen.
 */
export type BisnisMetric = { value: number; unit: string; label: string };
export type BisnisPanel = {
  num: string;
  title: string;
  summary: string;
  metric: string;
  metricLabel: string;
  bullets: string[];
  cta: string;
};
export type BisnisStep = { title: string; desc: string };

export type BisnisPageData = {
  hero: { title: string; intro: string; metrics: BisnisMetric[] };
  liniUtama: { panels: BisnisPanel[] };
  alurSts: { kicker: string; heading: string; intro: string; steps: BisnisStep[] };
  afiliasi: { kicker: string; heading: string; subtext: string };
  klien: {
    kicker: string;
    heading: string;
    stat1Unit: string;
    stat1Caption: string;
    stat2Value: string;
    stat2Unit: string;
    stat2Caption: string;
    placeholderNote: string;
  };
  cta: {
    kicker: string;
    heading: string;
    primaryButtonLabel: string;
    secondaryButtonLabel: string;
  };
  sectionIndexLabels: string[];
};

export const BISNIS_PAGE_DEFAULTS: BisnisPageData = {
  hero: {
    title: "Bisnis Kami",
    intro:
      "Dua lini dijalankan sendiri, tiga afiliasi di sekitarnya. Satu operator dari Banjarmasin sejak 1988.",
    metrics: [
      { value: 55, unit: "kapal", label: "Armada transportasi BBM" },
      { value: 9, unit: "kapal", label: "Armada penyeberangan Ro-Ro" },
      { value: 64, unit: "total", label: "Seluruh armada DML" },
    ],
  },
  liniUtama: {
    panels: [
      {
        num: "01",
        title: "Transportasi BBM",
        summary:
          "Distribusi bahan bakar cair ke pelabuhan dan pulau-pulau utama Indonesia, dari muat di terminal sampai serah di titik yang tidak terjangkau jetty konvensional.",
        metric: "55",
        metricLabel: "kapal pengangkut BBM",
        bullets: [
          "Motor Tanker (MT)",
          "Self Propelled Oil Barge",
          "Oil Barge (OB)",
          "Tugboat pendamping",
        ],
        cta: "Detail Transportasi BBM",
      },
      {
        num: "02",
        title: "Penyeberangan Ro-Ro",
        summary:
          "Layanan penyeberangan penumpang dan kendaraan dengan jadwal tetap di lintasan yang menghubungkan Jawa, Bali, Lombok, dan Kalimantan Tengah.",
        metric: "9",
        metricLabel: "kapal ro-ro penumpang",
        bullets: [
          "Ketapang - Gilimanuk",
          "Surabaya - Lembar",
          "Surabaya - Kumai",
          "Jangkar - Lembar",
        ],
        cta: "Detail Penyeberangan Ro-Ro",
      },
    ],
  },
  alurSts: {
    kicker: "02 · Cara kerja di lini BBM",
    heading: "Ship-to-ship, tiga tahap",
    intro:
      "Memindahkan bahan bakar langsung antar kapal di tengah perairan, tanpa menunggu antrean sandar pelabuhan.",
    steps: [
      {
        title: "Bertemu di area labuh",
        desc: "Kapal pengangkut menghampiri pasangannya di laut lepas, di luar antrean jetty.",
      },
      {
        title: "Tambat sisi-ke-sisi",
        desc: "Tali tambat dan fender menahan kedua lambung sepanjang operasi berlangsung.",
      },
      {
        title: "Selang tersambung",
        desc: "Awak menyeberang lewat jembatan penghubung untuk memasang selang transfer.",
      },
    ],
  },
  afiliasi: {
    kicker: "03 · Sinar Alam Corporation",
    heading: "Perusahaan afiliasi",
    subtext: "Tiga perusahaan yang berdiri sendiri di dalam grup, tidak dijalankan DML.",
  },
  klien: {
    kicker: "04 · Klien korporat",
    heading: "Dipercaya oleh perusahaan terkemuka",
    stat1Unit: "klien",
    stat1Caption: "Energi, tambang, dan pelayaran",
    stat2Value: "37",
    stat2Unit: "tahun",
    stat2Caption: "Mengangkut sejak 1988",
    placeholderNote:
      "AKR Corporindo masih placeholder tipografi — belum ada berkas logo resminya.",
  },
  cta: {
    kicker: "05 · Langkah berikutnya",
    heading: "Ada kebutuhan pengangkutan BBM atau penyeberangan?",
    primaryButtonLabel: "Ajukan permintaan informasi",
    secondaryButtonLabel: "Pesan tiket Ro-Ro",
  },
  sectionIndexLabels: [
    "01 Lini utama",
    "02 Ship-to-ship",
    "03 Afiliasi",
    "04 Klien",
    "05 Kontak",
  ],
};
