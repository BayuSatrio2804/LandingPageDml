import type { CollectionConfig } from "payload";
import { revalidateAllCollectionHooks } from "../revalidate-all";

/**
 * Lencana sertifikasi yang tampil di hero beranda, admin-editable. Dulu
 * hardcode di src/content/certifications.ts.
 *
 * `name` wajib sama persis dengan entri di company-profile.standards
 * kalau source-nya "cp-pdf" — tidak ada pengecekan otomatis di skema,
 * jaga manual saat menyunting.
 */
export const Certifications: CollectionConfig = {
  slug: "certifications",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "source", "order"],
    group: "Perusahaan",
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: revalidateAllCollectionHooks,
  fields: [
    { name: "name", type: "text", required: true },
    { name: "badge", type: "upload", relationTo: "media", required: true },
    { name: "alt", type: "text", required: true },
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
      admin: { description: "Angka lebih kecil tampil lebih dulu di hero." },
    },
  ],
  timestamps: true,
};
