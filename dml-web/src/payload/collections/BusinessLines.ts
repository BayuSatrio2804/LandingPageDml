import type { CollectionConfig } from "payload";
import { slugify } from "./Posts";
import { revalidateAll } from "../revalidate-all";

/**
 * Lini bisnis (dijalankan DML sendiri) dan afiliasi (di dalam Sinar Alam
 * Corporation, bukan lini DML), admin-editable. Dulu hardcode di
 * src/content/business-lines.ts.
 *
 * `mediaId` TETAP referensi ke src/lib/media/manifest.ts (pipeline AVIF
 * statis), bukan upload Payload — admin bisa ubah teks/urutan/highlight,
 * bukan foto lini bisnis (itu tetap gambar teroptimasi build-time).
 */
export const BusinessLines: CollectionConfig = {
  slug: "business-lines",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "kind", "number", "order"],
    group: "Bisnis",
    description:
      'Lini bisnis utama dan afiliasi. Tampil di Beranda dan halaman /bisnis, plus dipakai /bisnis/transportasi-bbm & /bisnis/penumpang-roro. Field "kind" memisahkan Lini utama vs Afiliasi.',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data;
        if (!data.slug && typeof data.title === "string") {
          data.slug = slugify(data.title);
        }
        return data;
      },
    ],
    afterChange: [() => revalidateAll()],
    afterDelete: [() => revalidateAll()],
  },
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { description: "Terisi otomatis dari judul. Dipakai kode untuk mencari entri ini." },
    },
    {
      name: "kind",
      type: "select",
      required: true,
      options: [
        { label: "Lini utama", value: "lini-utama" },
        { label: "Afiliasi", value: "afiliasi" },
      ],
    },
    { name: "number", type: "text", required: true, admin: { description: 'Contoh: "01".' } },
    { name: "title", type: "text", required: true },
    { name: "operator", type: "text", required: true },
    { name: "summary", type: "textarea", required: true },
    { name: "bullets", type: "text", hasMany: true, required: true },
    {
      name: "metric",
      type: "group",
      admin: { description: "Kosongkan kedua field untuk lini tanpa metrik (afiliasi)." },
      fields: [
        { name: "value", type: "text" },
        { name: "label", type: "text" },
      ],
    },
    {
      name: "mediaId",
      type: "text",
      admin: {
        description:
          "ID aset di src/lib/media/manifest.ts (pipeline gambar statis). Kosongkan kalau lini ini tidak punya foto.",
      },
    },
    {
      name: "order",
      type: "number",
      required: true,
      defaultValue: 0,
    },
  ],
  timestamps: true,
};
