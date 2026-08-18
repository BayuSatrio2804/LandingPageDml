import type { FooterGroup, NavItem } from "./types";

export const NAV_ITEMS: NavItem[] = [
  { label: "Tentang Kami", href: "/tentang-kami" },
  { label: "Bisnis Kami", href: "/bisnis" },
  { label: "Karier", href: "/karier" },
  { label: "Artikel", href: "/artikel" },
  { label: "Kontak", href: "/kontak" },
  { label: "BookJambo", href: "https://dutabahari.id", external: true },
];

export const FOOTER_GROUPS: FooterGroup[] = [
  /**
   * Dua lini, bukan tiga. Company profile resmi (`assets/CP DML.pdf` hal. 03)
   * menempatkan PT Dutabahari Menara Line Dockyard sebagai perusahaan terpisah
   * di dalam Sinar Alam Corporation, bukan lini bisnis DML, dan perawatan kapal
   * milik DML sendiri dikerjakan afiliasi Dutabahari Teknik. Footer yang tetap
   * mengiklankan "Galangan Kapal" sebagai lini DML membantah data yang dipakai
   * beranda dan halaman Tentang Kami.
   */
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
      { label: "Silsilah", href: "/tentang-kami#silsilah" },
      { label: "Company Profile", href: "/tentang-kami#profil" },
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
];
