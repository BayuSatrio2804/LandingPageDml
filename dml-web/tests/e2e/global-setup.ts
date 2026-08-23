import { spawnSync } from "node:child_process";

/**
 * Seed dijalankan sekali sebelum spec mana pun. Tanpa ini, admin-publish.spec
 * tidak punya akun untuk login: user pertama Payload lahir dari
 * /admin/create-first-user, dan mendorong spec melewati alur itu membuat tes
 * bergantung pada urutan eksekusi antar berkas spec.
 *
 * Seed bersifat idempoten, jadi menjalankannya di tiap run aman.
 */
export default function globalSetup() {
  const hasil = spawnSync("bun", ["run", "seed"], {
    stdio: "inherit",
    env: process.env,
  });
  if (hasil.status !== 0) {
    throw new Error(
      "seed gagal. Pastikan Postgres hidup dan SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD terisi di .env.local.",
    );
  }
}
