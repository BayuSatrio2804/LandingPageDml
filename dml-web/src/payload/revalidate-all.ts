import { revalidatePath } from "next/cache";

/**
 * Menyegarkan SELURUH pohon route yang ter-cache setelah admin menyunting
 * konten CMS lewat /admin.
 *
 * Pola aman-di-luar-konteks sama dengan amanRevalidatePath di Posts.ts dan
 * Categories.ts: revalidatePath melempar kalau dipanggil di luar konteks
 * request/build Next.js (mis. scripts/seed.ts dari proses bun mandiri).
 *
 * Dipakai koleksi dan global yang isinya muncul di banyak halaman statis
 * sekaligus -- armada, klien, sertifikasi, lini bisnis, kapal, dokumen
 * legal, profil perusahaan, navigasi. Halaman itu di-render ○ Static atau
 * ISR 1 jam, jadi tanpa penyegaran ini suntingan admin baru terlihat
 * setelah deploy berikutnya atau setelah jendela revalidasi lewat.
 *
 * Memakai scope "layout" supaya seluruh route di bawah root layout ikut
 * disegarkan sekaligus; situs ini lalu-lintasnya kecil, jadi biaya
 * membangun ulang halaman jauh lebih murah daripada memetakan tiap koleksi
 * ke daftar path yang tepat dan salah satunya terlewat.
 */
export function revalidateAll() {
  try {
    revalidatePath("/", "layout");
  } catch (error) {
    console.warn("revalidasi menyeluruh dilewati (di luar konteks Next)", error);
  }
}

/** Hook koleksi: segarkan semua saat dokumen berubah atau dihapus. */
export const revalidateAllCollectionHooks = {
  afterChange: [() => revalidateAll()],
  afterDelete: [() => revalidateAll()],
};

/** Hook global: global tidak punya afterDelete. */
export const revalidateAllGlobalHooks = {
  afterChange: [() => revalidateAll()],
};
