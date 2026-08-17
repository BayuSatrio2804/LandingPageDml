export type Port = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  kind: "pelabuhan" | "kantor";
};

export type RouteLeg = {
  id: string;
  fromId: string;
  toId: string;
  label: string;
};

/**
 * Koordinat geografis asli, bukan posisi tangan di ruang SVG seperti versi
 * sebelumnya. "Ketapang" di sini adalah Ketapang, Banyuwangi, Jawa Timur,
 * disimpulkan dari pasangan rutenya ke Lembar (Lombok) dan Tanjung Perak di
 * master spec bagian 2, bukan dari nama saja.
 */
export const PORTS: Port[] = [
  { id: "ketapang", name: "Ketapang", lat: -8.145, lon: 114.383, kind: "pelabuhan" }, // unverified: disimpulkan dari pasangan rute, wajib konfirmasi klien
  { id: "lembar", name: "Lembar", lat: -8.725, lon: 116.07, kind: "pelabuhan" }, // unverified: koordinat pelabuhan publik
  { id: "tanjung-perak", name: "Tanjung Perak Surabaya", lat: -7.2, lon: 112.73, kind: "pelabuhan" }, // unverified: koordinat pelabuhan publik
  { id: "kumai", name: "Kumai", lat: -2.74, lon: 111.73, kind: "pelabuhan" }, // unverified: koordinat pelabuhan publik
  { id: "banjarmasin", name: "Banjarmasin", lat: -3.32, lon: 114.59, kind: "kantor" },
];

/**
 * Tiga leg terpisah, bukan satu polyline berantai. Versi sebelumnya menyambung
 * keempat pelabuhan berurutan, yang menyiratkan satu rute tunggal yang tidak
 * pernah ada. Sumber: master spec bagian 2, Lini 2.
 */
export const ROUTE_LEGS: RouteLeg[] = [
  { id: "ketapang-lembar", fromId: "ketapang", toId: "lembar", label: "Ketapang ke Lembar, sejak Desember 2020" },
  { id: "perak-lembar", fromId: "tanjung-perak", toId: "lembar", label: "Tanjung Perak ke Lembar, 25 sampai 28 jam" },
  { id: "kumai-perak", fromId: "kumai", toId: "tanjung-perak", label: "Kumai ke Surabaya, sejak Juni 2025" },
];
