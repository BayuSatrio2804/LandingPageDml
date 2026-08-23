import type { CollectionConfig } from "payload";

/**
 * Turunkan slug dari judul. Diekspor supaya bisa diuji langsung dan supaya
 * scripts/seed.ts memakai aturan yang persis sama dengan yang dipakai admin.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "publishedAt", "_status"],
  },
  /**
   * drafts:true, bukan field bernama _status. Payload membangkitkan kolom
   * _status sendiri beserta tabel versi terpisah (_posts_v dan anaknya).
   * Konsekuensinya ada di migrasi: migrasi koleksi ini jauh lebih besar
   * daripada migrasi inquiries, dan keluarannya wajib dibaca sebelum
   * dikomit, bukan dianggap seragam dengan migrasi sebelumnya.
   */
  versions: { drafts: true },
  access: {
    /**
     * Publik hanya melihat published. Bentuknya where-constraint, bukan
     * false, supaya admin yang login tetap bisa membaca draft lewat REST
     * dan lewat admin panel.
     *
     * PERINGATAN yang tidak boleh dihapus: Local API `payload.find()`
     * memakai `overrideAccess: true` secara default, persis seperti
     * `payload.create()` yang sudah didokumentasikan di Inquiries.ts sejak
     * Plan 8. Artinya gerbang ini TIDAK melindungi Server Component yang
     * memanggil payload.find() langsung. Halaman publik wajib menyaring
     * _status sendiri di query-nya; itulah alasan seluruh query artikel
     * dipusatkan di src/features/articles/queries.ts, bukan disebar.
     * Kalau aturan itu dilanggar, draft tayang ke publik dengan build
     * hijau dan seluruh tes unit hijau.
     */
    read: ({ req: { user } }) =>
      Boolean(user) || { _status: { equals: "published" } },
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
  },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          "Terisi otomatis dari judul. Mengubahnya setelah artikel terbit membuat alamat lama mati.",
      },
    },
    {
      name: "excerpt",
      type: "textarea",
      required: true,
      maxLength: 200,
      admin: { description: "Dipakai sebagai meta description dan ringkasan di kartu." },
    },
    { name: "coverImage", type: "upload", relationTo: "media", required: true },
    { name: "content", type: "richText", required: true },
    {
      name: "category",
      type: "select",
      required: true,
      options: [
        { label: "Operasi", value: "operasi" },
        { label: "Armada", value: "armada" },
        { label: "Keselamatan", value: "keselamatan" },
        { label: "Perusahaan", value: "perusahaan" },
      ],
    },
    { name: "publishedAt", type: "date", required: true },
    { name: "author", type: "relationship", relationTo: "users", required: true },
    {
      name: "seo",
      type: "group",
      fields: [
        {
          name: "metaTitle",
          type: "text",
          admin: { description: "Opsional. Kosong berarti memakai judul artikel." },
        },
        {
          name: "metaDescription",
          type: "textarea",
          admin: { description: "Opsional. Kosong berarti memakai excerpt." },
        },
      ],
    },
  ],
  timestamps: true,
};
