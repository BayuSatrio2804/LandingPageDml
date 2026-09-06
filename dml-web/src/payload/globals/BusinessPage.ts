import type { GlobalConfig } from "payload";
import { revalidateAllGlobalHooks } from "../revalidate-all";

/**
 * Teks dua blok yang dirender di /tentang-kami: kartu afiliasi (AfiliasiCards)
 * dan pita klien (KlienMarquee). Dulu global ini menyimpan seluruh teks
 * halaman hub /bisnis (hero, panel lini utama, alur ship-to-ship, ajakan
 * penutup, label indeks samping) -- field-field itu dihapus bersamaan dengan
 * halaman hub-nya sendiri, yang sudah tidak ditautkan dari navigasi mana pun
 * dan sekarang di-redirect ke /tentang-kami (lihat next.config.ts).
 */
export const BusinessPage: GlobalConfig = {
  slug: "business-page",
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
