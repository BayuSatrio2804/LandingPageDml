import { defineConfig, devices } from "@playwright/test";

/**
 * bun run build/start dan scripts/seed.ts (lewat globalSetup) berjalan di
 * bawah runtime bun, yang otomatis memuat .env.local. Proses playwright
 * test sendiri adalah proses Node biasa (dari node_modules/.bin/playwright)
 * dan TIDAK ikut memuat .env.local secara otomatis, jadi
 * admin-publish.spec.ts yang membaca process.env.SEED_ADMIN_EMAIL langsung
 * akan selalu melihat string kosong tanpa baris ini. CI menyuntik env lewat
 * mekanismenya sendiri, bukan berkas, jadi kegagalan di sini dilewati diam
 * -diam kalau berkasnya memang tidak ada.
 */
try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local tidak ada di lingkungan ini (mis. CI). Lanjutkan dengan
  // env yang sudah disuntikkan dari luar.
}

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  globalSetup: "./tests/e2e/global-setup.ts",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "bun run build && bun run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
