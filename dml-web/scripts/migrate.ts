import payload from "payload";
import config from "../src/payload/payload.config";

/**
 * `bun run migrate` (lihat package.json) menjalankan berkas ini lewat
 * `bun build` lebih dulu, BUKAN `bun scripts/migrate.ts` langsung. Itu bukan
 * langkah opsional untuk kecepatan, dan berkas ini juga TIDAK memanggil CLI
 * `payload migrate` Payload sama sekali, sengaja.
 *
 * `payload migrate` (dan `bun run payload migrate`) gagal DETERMINISTIK di
 * dalam image Docker (oven/bun:1.3.14-slim) dengan:
 *   error: Cannot find module 'tsx://{"specifier":"./dist/bin/index.js",...}'
 * CLI Payload memuat payload.config.ts lewat tsx (node_modules/payload/bin.js),
 * dan tsx 4.22.4 punya bug terdokumentasi (github.com/payloadcms/payload/
 * issues/16949) yang bocor lewat `module.registerHooks` Node -- bin.js
 * sendiri sudah mencoba menambal ini, tapi tambalannya tidak menghilangkan
 * bug itu di bawah runtime bun. `--disable-transpile` melewati tsx, tapi
 * lalu menabrak race sirkular @lexical/react <-> lexical yang sama persis
 * dengan yang didokumentasikan di scripts/seed.ts, karena bin.js tetap
 * memuat payload.config.ts (yang membangun lexicalEditor()) secara dinamis.
 *
 * Solusinya sama dengan seed.ts: panggil API terprogram Payload langsung
 * (payload.init() + payload.db.migrate(), persis yang dilakukan
 * node_modules/payload/dist/bin/migrate.js secara internal), dan jalankan
 * lewat bundel satu berkas, bukan resolusi modul dinamis. Ini menghindari
 * KEDUA bug sekaligus: tidak ada bin.js CLI yang disentuh (tidak ada tsx),
 * dan resolusi modul statis di waktu bundle menghilangkan race lexical
 * (diverifikasi 8/8 run bersih di seed.ts, pola yang sama berlaku di sini).
 */
async function main() {
  process.env.PAYLOAD_MIGRATING = "true";

  await payload.init({
    config,
    disableOnInit: true,
  });

  const adapter = payload.db;
  if (!adapter) {
    throw new Error("Tidak ada database adapter yang ditemukan");
  }

  await adapter.migrate();
  console.log("migrasi selesai");
  process.exit(0);
}

main().catch((error) => {
  console.error("migrasi gagal:", error);
  process.exit(1);
});
