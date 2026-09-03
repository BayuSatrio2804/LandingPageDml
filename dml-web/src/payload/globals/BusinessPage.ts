import type { GlobalConfig } from "payload";
import { revalidateAllGlobalHooks } from "../revalidate-all";

/**
 * Teks halaman /bisnis (landing). Hardcode dari src/features/bisnis/*.
 * Angka armada, daftar afiliasi, dan logo klien tetap dari koleksi CMS.
 */
export const BusinessPage: GlobalConfig = {
  slug: "business-page",
  admin: {
    group: "Halaman: Bisnis",
    description:
      "Teks halaman Bisnis Kami: hero, dua panel lini utama, alur ship-to-ship, judul bagian afiliasi & klien, ajakan penutup, dan label indeks samping.",
  },
  access: { read: () => true, update: ({ req: { user } }) => Boolean(user) },
  hooks: revalidateAllGlobalHooks,
  fields: [
    {
      type: "collapsible",
      label: "Hero",
      fields: [
        {
          name: "hero",
          type: "group",
          label: false,
          fields: [
            { name: "title", type: "text", required: true },
            { name: "intro", type: "textarea", required: true },
            {
              name: "metrics",
              type: "array",
              minRows: 1,
              labels: { singular: "Angka", plural: "Angka" },
              fields: [
                { name: "value", type: "number", required: true },
                { name: "unit", type: "text", required: true },
                { name: "label", type: "text", required: true },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "collapsible",
      label: "Panel lini utama",
      fields: [
        {
          name: "liniUtama",
          type: "group",
          label: false,
          fields: [
            {
              name: "panels",
              type: "array",
              minRows: 1,
              maxRows: 2,
              labels: { singular: "Panel", plural: "Panel" },
              admin: {
                description:
                  "Urutan penting: panel pertama tautannya ke /bisnis/transportasi-bbm, kedua ke /bisnis/penumpang-roro.",
              },
              fields: [
                { name: "num", type: "text", required: true, admin: { description: 'Mis. "01".' } },
                { name: "title", type: "text", required: true },
                { name: "summary", type: "textarea", required: true },
                { name: "metric", type: "text", required: true },
                { name: "metricLabel", type: "text", required: true },
                { name: "bullets", type: "text", hasMany: true, required: true },
                { name: "cta", type: "text", required: true, admin: { description: "Teks tombol." } },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "collapsible",
      label: "Alur ship-to-ship",
      fields: [
        {
          name: "alurSts",
          type: "group",
          label: false,
          fields: [
            { name: "kicker", type: "text", required: true },
            { name: "heading", type: "text", required: true },
            { name: "intro", type: "textarea", required: true },
            {
              name: "steps",
              type: "array",
              minRows: 1,
              labels: { singular: "Tahap", plural: "Tahap" },
              fields: [
                { name: "title", type: "text", required: true },
                { name: "desc", type: "textarea", required: true },
              ],
            },
          ],
        },
      ],
    },
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
    {
      type: "collapsible",
      label: "Ajakan penutup",
      fields: [
        {
          name: "cta",
          type: "group",
          label: false,
          fields: [
            { name: "kicker", type: "text", required: true },
            { name: "heading", type: "text", required: true },
            { name: "primaryButtonLabel", type: "text", required: true, admin: { description: "Tombol ke halaman permintaan informasi." } },
            { name: "secondaryButtonLabel", type: "text", required: true, admin: { description: "Tombol ke situs pemesanan tiket." } },
          ],
        },
      ],
    },
    {
      type: "collapsible",
      label: "Label indeks samping",
      fields: [
        {
          name: "sectionIndexLabels",
          type: "text",
          hasMany: true,
          required: true,
          admin: { description: "Lima label navigasi mengambang di sisi kanan. Urutan = urutan bagian." },
        },
      ],
    },
  ],
};
