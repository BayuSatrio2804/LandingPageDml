import type { GlobalConfig } from "payload";
import { revalidateAllGlobalHooks } from "../revalidate-all";

/**
 * Teks halaman /tentang-kami. Judul dan prosa yang dulu hardcode di
 * src/features/about/* dan src/content/about.ts. Angka dan daftar (kapal,
 * dokumen legal, nilai inti, struktur grup) tetap dari CompanyProfile /
 * LegalDocuments.
 */
export const AboutPage: GlobalConfig = {
  slug: "about-page",
  admin: {
    group: "Halaman: Tentang Kami",
    description:
      "Semua teks di halaman Tentang Kami: hero, label angka, blok jati diri, nilai inti, struktur grup, legalitas, kantor, dan ajakan penutup.",
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
            { name: "intro1", type: "textarea", required: true },
            { name: "intro2", type: "textarea", required: true },
          ],
        },
      ],
    },
    {
      type: "collapsible",
      label: "Label deret angka",
      fields: [
        {
          name: "statLabels",
          type: "group",
          label: false,
          admin: { description: "Kalimat kecil di bawah tiap angka. Angkanya dihitung otomatis." },
          fields: [
            { name: "years", type: "text", required: true },
            { name: "ships", type: "text", required: true },
            { name: "people", type: "text", required: true },
            { name: "sectors", type: "text", required: true },
          ],
        },
      ],
    },
    {
      type: "collapsible",
      label: "Blok jati diri",
      fields: [
        {
          name: "identity",
          type: "array",
          minRows: 1,
          labels: { singular: "Blok", plural: "Blok" },
          admin: { description: "Bagian di seksi Jati Diri. Isi lead ATAU items, note opsional." },
          fields: [
            { name: "title", type: "text", required: true },
            { name: "lead", type: "textarea", admin: { description: "Paragraf pembuka. Kosongkan kalau memakai items." } },
            { name: "items", type: "text", hasMany: true, admin: { description: "Daftar butir. Kosongkan kalau memakai lead." } },
            { name: "note", type: "textarea", admin: { description: "Catatan kaki kecil, opsional." } },
          ],
        },
      ],
    },
    {
      type: "collapsible",
      label: "Nilai inti",
      fields: [
        {
          name: "coreValues",
          type: "group",
          label: false,
          fields: [
            { name: "heading", type: "text", required: true },
            { name: "intro", type: "textarea", required: true },
            { name: "medallionCaption", type: "text", required: true, admin: { description: 'Teks kecil di bawah medali "DML".' } },
          ],
        },
      ],
    },
    {
      type: "collapsible",
      label: "Struktur grup",
      fields: [
        {
          name: "groupChart",
          type: "group",
          label: false,
          fields: [
            { name: "heading", type: "text", required: true },
            { name: "intro", type: "textarea", required: true },
            { name: "parentName", type: "text", required: true, admin: { description: "Nama simpul induk di bagan." } },
            { name: "parentCaption", type: "text", required: true },
          ],
        },
      ],
    },
    {
      type: "collapsible",
      label: "Legalitas dan sertifikasi",
      fields: [
        {
          name: "legal",
          type: "group",
          label: false,
          fields: [
            { name: "heading", type: "text", required: true },
            { name: "standardsLabel", type: "text", required: true },
            { name: "membershipsLabel", type: "text", required: true },
            { name: "footnote", type: "textarea", required: true },
          ],
        },
      ],
    },
    {
      type: "collapsible",
      label: "Kantor",
      fields: [
        {
          name: "offices",
          type: "group",
          label: false,
          fields: [
            { name: "heading", type: "text", required: true },
            { name: "intro", type: "textarea", required: true },
            { name: "dmlOwnerLabel", type: "text", required: true },
            { name: "groupOwnerLabel", type: "text", required: true },
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
            { name: "heading", type: "text", required: true },
            { name: "primaryButtonLabel", type: "text", required: true, admin: { description: "Tombol ke /bisnis." } },
            { name: "secondaryButtonLabel", type: "text", required: true, admin: { description: "Tombol ke /kontak." } },
          ],
        },
      ],
    },
  ],
};
