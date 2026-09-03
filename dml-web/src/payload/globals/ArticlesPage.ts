import type { GlobalConfig } from "payload";

/**
 * Copy admin-editable untuk kepala halaman /artikel. Sebelumnya teks ini
 * hardcode di page.tsx; dipindah ke global supaya redaksi bisa mengubah
 * heading/intro tanpa deploy.
 */
export const ArticlesPage: GlobalConfig = {
  slug: "articles-page",
  admin: {
    group: "Halaman",
  },
  fields: [
    {
      name: "heading",
      type: "text",
      required: true,
      defaultValue: "Artikel",
    },
    {
      name: "intro",
      type: "textarea",
      required: true,
      defaultValue: "Kabar operasi, armada, dan keselamatan dari lapangan.",
    },
    {
      name: "notice",
      type: "text",
      admin: {
        description: "Pita catatan opsional di bawah intro. Kosongkan untuk menyembunyikannya.",
      },
    },
    {
      name: "pageSize",
      type: "number",
      required: true,
      defaultValue: 6,
      min: 3,
      admin: {
        description: "Jumlah kartu per halaman sebelum tombol \"Muat lebih banyak\" dipakai.",
      },
    },
    {
      name: "featured",
      type: "relationship",
      relationTo: "posts",
      admin: {
        description: "Kosongkan untuk memakai artikel terbit terbaru secara otomatis.",
      },
    },
    {
      name: "shareChannels",
      type: "select",
      hasMany: true,
      required: true,
      defaultValue: ["whatsapp", "linkedin", "x", "email", "copy"],
      options: [
        { label: "WhatsApp", value: "whatsapp" },
        { label: "LinkedIn", value: "linkedin" },
        { label: "X", value: "x" },
        { label: "Surel", value: "email" },
        { label: "Salin tautan", value: "copy" },
      ],
    },
  ],
};
