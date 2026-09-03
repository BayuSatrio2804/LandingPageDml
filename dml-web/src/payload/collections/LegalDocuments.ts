import type { CollectionConfig } from "payload";
import { revalidateAllCollectionHooks } from "../revalidate-all";

/**
 * Tabel dokumen legal (akta, izin usaha, pendaftaran, pajak) dari company
 * profile resmi halaman 06, admin-editable. Dulu hardcode di src/content/
 * legal-documents.ts.
 *
 * Pengelompokan tampil (Akta / Izin usaha dan operasional / Pendaftaran dan
 * pajak) TIDAK ada di sini — itu tetap konfigurasi statis di
 * src/content/about.ts (`LEGAL_GROUPS`), dicocokkan lewat field `document`
 * di sini. Kalau admin mengubah teks `document` sebuah baris, baris itu
 * berhenti tampil di kelompoknya sampai `LEGAL_GROUPS` ikut diperbarui —
 * dianggap risiko yang lebih aman daripada memindahkan pengelompokan juga
 * ke CMS, karena kelompoknya sendiri jarang berubah.
 */
export const LegalDocuments: CollectionConfig = {
  slug: "legal-documents",
  admin: {
    useAsTitle: "document",
    defaultColumns: ["order", "document", "number", "source"],
    group: "Perusahaan",
  },
  defaultSort: "order",
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: revalidateAllCollectionHooks,
  fields: [
    { name: "document", type: "text", required: true, unique: true },
    { name: "number", type: "text", required: true },
    { name: "issuer", type: "text", required: true },
    {
      name: "source",
      type: "select",
      required: true,
      options: ["cp-pdf", "riset-publik", "belum-terverifikasi"],
    },
    {
      name: "order",
      type: "number",
      required: true,
      defaultValue: 0,
      admin: { description: "Angka lebih kecil tampil lebih dulu di kelompoknya." },
    },
  ],
  timestamps: true,
};
