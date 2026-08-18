import type { BusinessLine } from "./types";

/**
 * Struktur lini bisnis mengikuti company profile resmi `assets/CP DML.pdf`
 * halaman 03, yang membaginya jadi dua tingkat: dua lini utama yang dijalankan
 * PT Dutabahari Menara Line sendiri, lalu tiga perusahaan afiliasi yang
 * digambar di bawahnya lewat kurung siku.
 *
 * Dua perubahan dari versi Plan 4:
 *
 * 1. "Layanan Ship-to-Ship" dihapus sebagai lini bisnis. STS tidak pernah
 *    disebut sebagai lini di PDF, ia cara kerja di dalam lini transportasi
 *    BBM, dan penjelasan lengkapnya sudah jadi isi seksi tersendiri
 *    (day-cut.tsx). Mempertahankannya berarti satu halaman menjelaskan STS
 *    dua kali dengan bobot berbeda.
 * 2. Tri Sumaja Lines, Duta Wisata Bahari, dan Dutabahari Teknik masuk
 *    sebagai afiliasi, bukan sebagai lini DML. Rute Merak-Bakauheni
 *    dioperasikan TSL, jadi ia tidak boleh diklaim dengan kalimat yang sama
 *    dengan rute yang dijalankan DML.
 */
export const BUSINESS_LINES: BusinessLine[] = [
  {
    id: "transportasi-bbm",
    kind: "lini-utama",
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
  },
  {
    id: "penumpang-roro",
    kind: "lini-utama",
    number: "02",
    title: "Penyeberangan Ro-Ro",
    operator: "Dijalankan langsung oleh PT Dutabahari Menara Line",
    summary:
      "Layanan penyeberangan penumpang dan kendaraan dengan jadwal tetap di lintasan yang menghubungkan Jawa, Bali, Lombok, dan Kalimantan Tengah.",
    bullets: ["Ketapang - Gilimanuk", "Surabaya - Lembar", "Surabaya - Kumai", "Jangkar - Lembar"],
    metric: { value: "9", label: "kapal ro-ro penumpang" },
    mediaId: "penumpang-roro",
  },
  {
    id: "tri-sumaja-lines",
    kind: "afiliasi",
    number: "03",
    title: "PT Tri Sumaja Lines",
    operator: "Afiliasi",
    summary: "Mengoperasikan kapal penumpang untuk pelayaran domestik.",
    bullets: ["Merak - Bakauheni"],
    metric: null,
    mediaId: null,
  },
  {
    id: "duta-wisata-bahari",
    kind: "afiliasi",
    number: "04",
    title: "PT Duta Wisata Bahari",
    operator: "Afiliasi",
    summary: "Kapal wisata untuk island hopping di Labuan Bajo.",
    bullets: ["Private boat charter", "Open trip"],
    metric: null,
    mediaId: null,
  },
  {
    id: "dutabahari-teknik",
    kind: "afiliasi",
    number: "05",
    title: "Dutabahari Teknik",
    operator: "Afiliasi",
    summary: "Perbaikan dan perawatan kapal untuk armada DML sendiri maupun pihak ketiga.",
    bullets: ["Perbaikan lambung dan mesin", "Perawatan berkala"],
    metric: null,
    mediaId: null,
  },
];

export const MAIN_LINES = BUSINESS_LINES.filter((line) => line.kind === "lini-utama");
export const AFFILIATES = BUSINESS_LINES.filter((line) => line.kind === "afiliasi");
