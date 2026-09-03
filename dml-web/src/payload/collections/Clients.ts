import type { CollectionConfig } from "payload";
import { revalidateAllCollectionHooks } from "../revalidate-all";

/**
 * Daftar klien "Trusted by Leading Companies" (company profile hal. 06),
 * admin-editable. Dulu hardcode di src/content/clients.ts.
 *
 * `sector` adalah bidang usaha klien, BUKAN pernyataan tentang isi
 * kontraknya dengan DML — jangan biarkan admin mengisi nilai kontrak di
 * sini tanpa konfirmasi (lihat komentar lama di src/lib/cms/clients-seed.ts).
 */
export const Clients: CollectionConfig = {
  slug: "clients",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "sector", "order"],
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
    { name: "sector", type: "text", required: true },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Kosongkan untuk merender nama klien sebagai teks (belum ada logo resmi).",
      },
    },
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
      admin: { description: "Angka lebih kecil tampil lebih dulu di marquee." },
    },
  ],
  timestamps: true,
};
