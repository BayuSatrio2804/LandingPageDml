import type { GlobalConfig } from "payload";
import { revalidateAllGlobalHooks } from "../revalidate-all";

/**
 * Teks hero Beranda (bidang dua pintu paling atas). Sebelumnya hardcode di
 * src/features/home/hero-copy.tsx dan hero-doors.tsx.
 *
 * mediaId foto panel TIDAK ada di sini — gambar hero tetap dari pipeline
 * AVIF build-time (src/lib/media/manifest.ts). Yang bisa diubah admin cuma
 * teks dan angka.
 */
export const HomeHero: GlobalConfig = {
  slug: "home-hero",
  admin: {
    group: "Halaman: Beranda",
    description:
      "Teks paling atas Beranda: baris kecil, judul besar, sub-teks, label gulir, dan dua kartu lini bisnis (kiri BBM, kanan Ro-Ro).",
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  hooks: revalidateAllGlobalHooks,
  fields: [
    {
      name: "eyebrow",
      type: "text",
      required: true,
      admin: { description: "Baris kecil huruf kapital di atas judul." },
    },
    {
      name: "headline",
      type: "text",
      required: true,
      admin: {
        description:
          "Judul utama. Usahakan maksimal 7 kata supaya tetap dua baris di layar lebar.",
      },
    },
    {
      name: "subheadline",
      type: "text",
      required: true,
      admin: { description: "Satu kalimat di bawah judul. Maksimal sekitar 20 kata." },
    },
    {
      name: "scrollLabel",
      type: "text",
      required: true,
      defaultValue: "Gulir",
      admin: { description: 'Kata di indikator gulir bawah, mis. "Gulir".' },
    },
    {
      name: "bbm",
      type: "group",
      label: "Kartu kiri — Transportasi BBM",
      fields: [
        { name: "label", type: "text", required: true },
        {
          name: "value",
          type: "number",
          required: true,
          admin: { description: "Angka besar di kartu, mis. jumlah tanker." },
        },
        { name: "unit", type: "text", required: true, admin: { description: 'Satuan, mis. "Tanker".' } },
        { name: "description", type: "textarea", required: true },
        { name: "ctaLabel", type: "text", required: true, admin: { description: "Teks tombol. Tautannya tetap ke halaman permintaan informasi BBM." } },
      ],
    },
    {
      name: "roro",
      type: "group",
      label: "Kartu kanan — Penyeberangan Ro-Ro",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "value", type: "number", required: true },
        { name: "unit", type: "text", required: true },
        { name: "description", type: "textarea", required: true },
        { name: "ctaLabel", type: "text", required: true },
        {
          name: "ctaHref",
          type: "text",
          required: true,
          admin: { description: "Tautan tombol Ro-Ro, mis. situs pemesanan tiket." },
        },
      ],
    },
  ],
};
