import type { GlobalConfig } from "payload";
import { revalidateAllGlobalHooks } from "../revalidate-all";

/**
 * Teks dua blok yang dirender di /tentang-kami: kartu afiliasi (AfiliasiCards)
 * dan pita klien (KlienMarquee).
 *
 * Riwayat: dulu global ini bernama `business-page` dan menyimpan seluruh
 * teks halaman hub /bisnis (hero, panel lini utama, alur ship-to-ship,
 * ajakan penutup, label indeks samping). Halaman hub itu sudah dihapus --
 * sudah tidak ditautkan dari navigasi mana pun dan sekarang di-redirect ke
 * /tentang-kami (lihat next.config.ts) -- jadi field-field itu dihapus dan
 * globalnya di-rename supaya tidak lagi menyebut halaman yang tidak ada.
 */
export const AfiliasiKlien: GlobalConfig = {
  slug: "afiliasi-klien",
  admin: {
    group: "Halaman: Tentang Kami",
    description:
      "Teks dua blok di halaman Tentang Kami yang berasal dari sini: bagian afiliasi & bagian klien.",
  },
  access: { read: () => true, update: ({ req: { user } }) => Boolean(user) },
  hooks: revalidateAllGlobalHooks,
  fields: [
    {
      type: "collapsible",
      label: "Bagian afiliasi",
      fields: [
        {
          name: "afiliasi",
          type: "group",
          label: false,
          fields: [
            { name: "kicker", type: "text", required: true },
            { name: "heading", type: "text", required: true },
            { name: "subtext", type: "textarea", required: true },
          ],
        },
      ],
    },
    {
      type: "collapsible",
      label: "Bagian klien",
      fields: [
        {
          name: "klien",
          type: "group",
          label: false,
          fields: [
            { name: "kicker", type: "text", required: true },
            { name: "heading", type: "text", required: true },
            { name: "stat1Unit", type: "text", required: true, admin: { description: 'Satuan angka jumlah klien, mis. "klien".' } },
            { name: "stat1Caption", type: "text", required: true },
            { name: "stat2Value", type: "text", required: true },
            { name: "stat2Unit", type: "text", required: true },
            { name: "stat2Caption", type: "text", required: true },
            { name: "placeholderNote", type: "textarea", required: true, admin: { description: "Catatan kecil di bawah pita logo." } },
          ],
        },
      ],
    },
  ],
};
