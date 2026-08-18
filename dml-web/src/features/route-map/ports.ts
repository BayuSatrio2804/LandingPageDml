export type Port = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  kind: "pelabuhan" | "kantor";
  /**
   * Sisi label relatif titik, supaya label tidak keluar bingkai dan tidak
   * saling menimpa. Merak dan Bakauheni hanya berjarak sekitar 27 km, yaitu
   * belasan piksel di peta selebar 14,5 derajat, dan keduanya menempel di tepi
   * barat bbox: label mendatar untuk pasangan itu pasti terpotong tepi atau
   * saling menimpa, jadi keduanya ditumpuk vertikal.
   */
  labelSide?: "kiri" | "kanan" | "atas" | "bawah";
};

export type RouteOperator = "dml" | "tsl";

export type RouteLeg = {
  id: string;
  fromId: string;
  toId: string;
  label: string;
  operator: RouteOperator;
  /** Keterangan pendek satu baris di bawah label. */
  note: string;
};

/**
 * Koordinat geografis asli, bukan posisi tangan di ruang SVG. Daftar lintasan
 * mengikuti company profile resmi `assets/CP DML.pdf` halaman 03 dan 04, yang
 * mengoreksi tiga hal dari versi Plan 4:
 *
 * - Pasangan Ketapang adalah Gilimanuk, bukan Lembar. Ketapang di sini tetap
 *   Ketapang, Banyuwangi, Jawa Timur; penyeberangan Ketapang-Gilimanuk adalah
 *   lintasan Selat Bali yang memang dilayani armada Jambo.
 * - Merak-Bakauheni masuk peta, tapi sebagai lintasan PT Tri Sumaja Lines.
 *   Halaman 04 mendaftar KMP BSP 1 dan KMP Salvatore di lintasan itu, halaman
 *   03 menaruh TSL sebagai operatornya, jadi keduanya dicatat apa adanya.
 * - Jangkar-Lembar adalah lintasan baru yang tidak pernah ada di riset publik.
 */
export const PORTS: Port[] = [
  { id: "merak", name: "Merak", lat: -5.93, lon: 105.995, kind: "pelabuhan", labelSide: "bawah" }, // unverified: koordinat pelabuhan publik
  { id: "bakauheni", name: "Bakauheni", lat: -5.868, lon: 105.752, kind: "pelabuhan", labelSide: "atas" }, // unverified: koordinat pelabuhan publik
  { id: "tanjung-perak", name: "Surabaya", lat: -7.2, lon: 112.73, kind: "pelabuhan", labelSide: "kiri" }, // unverified: Pelabuhan Tanjung Perak
  { id: "jangkar", name: "Jangkar", lat: -7.7, lon: 114.19, kind: "pelabuhan", labelSide: "kiri" }, // unverified: koordinat pelabuhan publik
  { id: "ketapang", name: "Ketapang", lat: -8.145, lon: 114.383, kind: "pelabuhan", labelSide: "kiri" }, // unverified: Ketapang, Banyuwangi
  { id: "gilimanuk", name: "Gilimanuk", lat: -8.163, lon: 114.437, kind: "pelabuhan", labelSide: "kanan" }, // unverified: koordinat pelabuhan publik
  { id: "lembar", name: "Lembar", lat: -8.725, lon: 116.07, kind: "pelabuhan", labelSide: "kanan" }, // unverified: koordinat pelabuhan publik
  { id: "kumai", name: "Kumai", lat: -2.74, lon: 111.73, kind: "pelabuhan", labelSide: "kiri" }, // unverified: koordinat pelabuhan publik
  { id: "banjarmasin", name: "Banjarmasin", lat: -3.32, lon: 114.59, kind: "kantor", labelSide: "kanan" },
];

/**
 * Urutan array adalah urutan gambar di animasi peta: dari Selat Sunda di barat,
 * menyeberang ke Selat Bali, lalu ke timur ke Lombok, dan ditutup dengan leg
 * yang naik ke Kalimantan. Penutup itu disengaja, karena Kalimantan tempat
 * perusahaannya berkantor.
 */
export const ROUTE_LEGS: RouteLeg[] = [
  {
    id: "merak-bakauheni",
    fromId: "merak",
    toId: "bakauheni",
    label: "Merak - Bakauheni",
    operator: "tsl",
    note: "Dioperasikan PT Tri Sumaja Lines",
  },
  {
    id: "ketapang-gilimanuk",
    fromId: "ketapang",
    toId: "gilimanuk",
    label: "Ketapang - Gilimanuk",
    operator: "dml",
    note: "Lintasan Selat Bali",
  },
  {
    id: "jangkar-lembar",
    fromId: "jangkar",
    toId: "lembar",
    label: "Jangkar - Lembar",
    operator: "dml",
    note: "Jawa Timur ke Lombok",
  },
  {
    id: "perak-lembar",
    fromId: "tanjung-perak",
    toId: "lembar",
    label: "Surabaya - Lembar",
    operator: "dml",
    note: "Lintasan jarak jauh Tanjung Perak",
  },
  {
    id: "kumai-perak",
    fromId: "tanjung-perak",
    toId: "kumai",
    label: "Surabaya - Kumai",
    operator: "dml",
    note: "Jawa Timur ke Kalimantan Tengah",
  },
];

/**
 * Pelabuhan yang benar-benar disinggahi armada DML sendiri. Metrik beranda
 * memakai ini, bukan PORTS.length: kantor pusat ikut hidup di PORTS supaya
 * bisa digambar di peta, dan Merak-Bakauheni dioperasikan afiliasi.
 */
export const DML_SERVED_PORT_IDS: string[] = [
  ...new Set(
    ROUTE_LEGS.filter((leg) => leg.operator === "dml").flatMap((leg) => [leg.fromId, leg.toId]),
  ),
];
