import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Ditulis tangan, bukan hasil `payload migrate:create`: drizzle-kit
 * bertanya interaktif "created or renamed?" untuk kasus ini (satu tabel
 * hilang, satu tabel baru muncul dengan kolom identik), dan jawabannya harus
 * "renamed" supaya data admin yang sudah diisi (kicker/heading/dll) tidak
 * ikut hilang seperti kalau dijawab "created" (DROP lalu CREATE kosong).
 * Tidak ada tabel anak (business_page_* lain) dan tidak ada kolom FK di
 * payload_locked_documents_rels yang menunjuk ke sini -- globals Payload
 * tidak ikut sistem locked-documents seperti koleksi -- jadi RENAME polos
 * sudah cukup.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "business_page" RENAME TO "afiliasi_klien";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "afiliasi_klien" RENAME TO "business_page";`)
}
