import path from "node:path";
import type { CollectionConfig } from "payload";

/**
 * Dipaku eksplisit sejak Plan 9. Sebelumnya koleksi ini memakai default
 * Payload, dan tidak ada satu pun berkas yang pernah diunggah sehingga
 * lokasinya tidak pernah diamati siapa pun.
 *
 * Di container, upload yang mendarat di luar volume hilang tiap redeploy,
 * dan hilangnya senyap: unggah berhasil, gambar tampil, lalu dua minggu
 * kemudian seluruh cover artikel rusak.
 *
 * BUKAN public/media/. Direktori itu milik pipeline aset kurasi (alur-sts,
 * bisnis, hari, lini-bisnis) yang isinya dikomit ke git. Upload admin
 * bersifat runtime dan tidak pernah dikomit; menyatukan keduanya membuat
 * `git status` kotor tiap kali klien mengunggah gambar.
 *
 * Diekspor terpisah (bukan dibaca balik dari Media.upload.staticDir) supaya
 * pemanggil lain -- opengraph-image.tsx artikel butuh path disk yang sama
 * untuk membaca byte cover -- tidak perlu menangani union type
 * `boolean | UploadConfig` milik CollectionConfig.upload.
 */
export const MEDIA_STATIC_DIR =
  process.env.PAYLOAD_UPLOAD_DIR ?? path.resolve(process.cwd(), "uploads");

export const Media: CollectionConfig = {
  slug: "media",
  access: { read: () => true },
  upload: {
    staticDir: MEDIA_STATIC_DIR,
    imageSizes: [
      { name: "thumbnail", width: 400 },
      { name: "card", width: 1080 },
    ],
    mimeTypes: ["image/*"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      admin: { description: "Alt text bahasa Indonesia, wajib diisi." },
    },
  ],
};
