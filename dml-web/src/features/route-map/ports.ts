export type Port = {
  name: string;
  x: number;
  y: number;
};

/**
 * Koordinat x/y dalam viewBox SVG 400x300, bukan koordinat geografis
 * asli. Posisi relatif disusun tangan supaya keempat pelabuhan terbaca
 * sebagai jaringan Ketapang - Lembar - Tanjung Perak - Kumai, sesuai
 * urutan rute di spec bagian 2, bukan proyeksi peta akurat.
 */
export const PORTS: Port[] = [
  { name: "Ketapang", x: 40, y: 220 },
  { name: "Lembar", x: 110, y: 260 },
  { name: "Tanjung Perak Surabaya", x: 220, y: 180 },
  { name: "Kumai", x: 320, y: 90 },
];
