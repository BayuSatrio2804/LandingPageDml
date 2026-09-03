import type { CollectionConfig } from "payload";

export const Inquiries: CollectionConfig = {
  slug: "inquiries",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "phone", "service", "createdAt"],
    group: "Sistem",
    description:
      "Lead yang masuk dari form /kontak dan /bisnis/transportasi-bbm/permintaan-informasi. Hanya untuk dibaca — jangan buat entri manual di sini.",
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    // Nol tulis dari mana pun kecuali submitInquiry. Local API
    // payload.create() memakai overrideAccess: true secara default
    // (terverifikasi di tipe Payload 3.88,
    // node_modules/payload/dist/collections/operations/local/create.d.ts:54
    // menandainya @default true), jadi server action tetap bisa menulis
    // meski gerbang ini tertutup rapat.
    //
    // Yang berubah: tombol "Create New" hilang dari UI admin. Cek asap
    // 23 Agustus 2026 menemukan tombol itu masih ada, yang membantah
    // master spec bagian 10 yang menyebut koleksi ini read-only. Lead
    // yang diketik manual admin akan tercampur dengan lead sungguhan
    // dari form, dan kolom `source` yang jadi pembedanya jadi berbohong.
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "company", type: "text" },
    { name: "phone", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "service", type: "text" },
    { name: "message", type: "textarea", required: true },
    { name: "source", type: "text", required: true },
  ],
  timestamps: true,
};
