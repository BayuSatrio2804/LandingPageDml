import type { CollectionConfig } from "payload";
import { revalidatePath } from "next/cache";

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

/**
 * revalidatePath, bukan revalidateTag. Di Next 16 revalidateTag(tag) satu
 * argumen sudah deprecated, dan unstable_cache ditandai digantikan `use
 * cache`, yang hanya tersedia kalau cacheComponents menyala. cacheComponents
 * dimatikan untuk rilis ini karena dukungan Payload belum dijamin, dan
 * karena menyalakannya juga menghilangkan dynamicParams yang jadi tumpuan
 * alur publish. Alasan lengkap ada di spec Plan 8 bagian 10.2.
 *
 * Empat permukaan, dan cuma empat, yang memuat artikel:
 * daftar, detail, beranda (seksi Artikel Terbaru), dan sitemap.
 *
 * Cakupan revalidatePath("/sitemap.xml") atas metadata route sitemap.ts
 * diverifikasi empiris di Task 11 Plan 9: ubah slug lewat REST API (setara
 * /admin) tanpa restart server, sitemap.xml langsung memuat slug baru dan
 * tidak lagi memuat slug lama. Bekerja.
 */
/**
 * revalidatePath melempar "Invariant: static generation store missing"
 * kalau dipanggil di luar konteks request/build Next.js. scripts/seed.ts
 * memanggil payload.create() langsung dari proses bun mandiri, tanpa
 * server Next yang berjalan, sehingga hook ini tetap terpicu tapi tidak
 * ada apa pun yang perlu disegarkan (belum ada halaman yang sempat
 * di-cache). Menangkap galat itu di sini, bukan di seed.ts, supaya
 * pemanggil manapun di luar konteks Next tetap aman, bukan cuma seed.
 */
function amanRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch (error) {
    console.warn(`revalidasi dilewati (di luar konteks Next): ${path}`, error);
  }
}

function revalidasiArtikel(slugs: Array<string | undefined>) {
  amanRevalidatePath("/artikel");
  for (const slug of new Set(slugs.filter(Boolean))) {
    amanRevalidatePath(`/artikel/${slug}`);
  }
  amanRevalidatePath("/");
  amanRevalidatePath("/sitemap.xml");
}

/** Kumpulkan teks polos dari satu dokumen richText Lexical (blok paragraph). */
function teksDariRichText(doc: unknown): string {
  if (!doc || typeof doc !== "object") return "";
  const root = (doc as { root?: { children?: unknown[] } }).root;
  if (!root || !Array.isArray(root.children)) return "";
  const potong: string[] = [];
  const jelajah = (nodes: unknown[]) => {
    for (const node of nodes) {
      if (!node || typeof node !== "object") continue;
      const n = node as { text?: unknown; children?: unknown[] };
      if (typeof n.text === "string") potong.push(n.text);
      if (Array.isArray(n.children)) jelajah(n.children);
    }
  };
  jelajah(root.children);
  return potong.join(" ");
}

/**
 * Teks polos dari seluruh blok isi artikel, dipakai murni untuk menaksir
 * lama baca. Blok "paragraph" menyimpan richText di field text; blok
 * "heading"/"quote" menyimpan string biasa; blok "image" tidak punya teks.
 */
function teksDariBlok(blocks: unknown): string {
  if (!Array.isArray(blocks)) return "";
  return blocks
    .map((block) => {
      if (!block || typeof block !== "object") return "";
      const b = block as { blockType?: string; text?: unknown };
      switch (b.blockType) {
        case "paragraph":
          return teksDariRichText(b.text);
        case "heading":
        case "quote":
          return typeof b.text === "string" ? b.text : "";
        default:
          return "";
      }
    })
    .join(" ");
}

/**
 * Lama baca dihitung otomatis dari panjang isi, bukan diisi manual admin,
 * supaya tidak pernah basi terhadap isi asli setelah artikel disunting.
 * 200 kata/menit adalah taksiran baca santai bahasa Indonesia, dibulatkan
 * ke atas dan minimal 1 menit supaya artikel pendek tidak menampilkan "0".
 */
function hitungMenitBaca(content: unknown): number {
  const teks = teksDariBlok(content);
  const jumlahKata = teks.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(jumlahKata / 200));
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
    beforeChange: [
      ({ data }) => {
        if (!data) return data;
        if (Array.isArray(data.content)) {
          data.readingMinutes = hitungMenitBaca(data.content);
        }
        return data;
      },
    ],
    afterChange: [
      ({ doc, previousDoc }) => {
        // Slug lama ikut disegarkan. Kalau tidak, artikel yang slug-nya
        // diubah akan tetap hidup di alamat lama sebagai halaman hantu
        // yang isinya versi basi.
        revalidasiArtikel([doc?.slug, previousDoc?.slug]);
      },
    ],
    afterDelete: [
      ({ doc }) => {
        revalidasiArtikel([doc?.slug]);
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
    {
      name: "content",
      type: "blocks",
      required: true,
      blocks: [
        {
          slug: "paragraph",
          fields: [{ name: "text", type: "richText", required: true }],
        },
        {
          slug: "heading",
          fields: [{ name: "text", type: "text", required: true }],
        },
        {
          slug: "quote",
          fields: [
            { name: "text", type: "text", required: true },
            { name: "attribution", type: "text" },
          ],
        },
        {
          slug: "image",
          fields: [
            { name: "image", type: "upload", relationTo: "media", required: true },
            { name: "caption", type: "text" },
          ],
        },
      ],
    },
    {
      name: "readingMinutes",
      type: "number",
      admin: {
        readOnly: true,
        description: "Dihitung otomatis dari panjang isi saat disimpan.",
      },
    },
    { name: "category", type: "relationship", relationTo: "categories", required: true },
    { name: "publishedAt", type: "date", required: true },
    { name: "author", type: "relationship", relationTo: "users", required: true },
    {
      name: "relatedOverride",
      type: "relationship",
      relationTo: "posts",
      hasMany: true,
      admin: {
        description:
          "Pilihan manual artikel terkait. Kosongkan untuk memakai kategori sama + terbaru secara otomatis.",
      },
    },
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
