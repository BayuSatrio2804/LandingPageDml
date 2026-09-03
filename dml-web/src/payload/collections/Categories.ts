import type { CollectionConfig } from "payload";
import { revalidatePath } from "next/cache";
import { slugify } from "./Posts";

/**
 * revalidatePath melempar di luar konteks request/build Next.js (mis. saat
 * scripts/seed.ts memanggil payload.create() dari proses bun mandiri).
 * Pola sama persis dengan amanRevalidatePath di Posts.ts.
 */
function amanRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch (error) {
    console.warn(`revalidasi dilewati (di luar konteks Next): ${path}`, error);
  }
}

/**
 * Kategori bukan koleksi berdraft, tapi namanya tampil di setiap kartu
 * artikel dan halaman detail. Mengubah nama kategori tanpa menyegarkan
 * /artikel dan beranda berarti label lama tetap terlihat di halaman yang
 * sudah di-cache sampai revalidasi berikutnya datang dari artikel itu
 * sendiri, yang bisa jadi tidak segera.
 */
export const Categories: CollectionConfig = {
  slug: "categories",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug"],
    group: "Artikel",
    description:
      "Kategori filter di /artikel. Namanya juga tampil di tiap kartu artikel dan halaman detail.",
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
        if (!data.slug && typeof data.name === "string") {
          data.slug = slugify(data.name);
        }
        return data;
      },
    ],
    afterChange: [
      () => {
        amanRevalidatePath("/artikel");
        amanRevalidatePath("/");
      },
    ],
    afterDelete: [
      () => {
        amanRevalidatePath("/artikel");
        amanRevalidatePath("/");
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description: "Terisi otomatis dari nama.",
      },
    },
  ],
  timestamps: true,
};
