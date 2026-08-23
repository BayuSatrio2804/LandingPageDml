import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  /**
   * useAsTitle memakai `name`, bukan `email`. Sejak Plan 9 koleksi ini jadi
   * target relasi `posts.author`, dan judul baris koleksi ikut jadi label
   * dropdown relasi di admin. Dengan `email`, editor memilih penulis dari
   * daftar alamat email, dan alamat itu juga yang berpotensi terbawa ke
   * byline artikel yang tayang publik.
   */
  admin: { useAsTitle: "name" },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      admin: { description: "Nama yang tampil sebagai penulis artikel." },
    },
  ],
};
