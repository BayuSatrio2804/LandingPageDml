import { test, expect } from "@playwright/test";

test("kelas lenis terpasang di html saat motion normal", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/lenis/);
});

test.describe("dengan reduced motion aktif", () => {
  // reducedMotion bukan properti langsung di PlaywrightTestOptions versi
  // 1.62 yang terinstal, hanya disebut di contoh dokumentasi. Properti nyata
  // yang typecheck adalah contextOptions, diverifikasi langsung dari
  // node_modules/playwright/types/test.d.ts sebelum task ini didispatch.
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("konten tetap tampil penuh dan Lenis tidak pernah aktif", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    // Ini gerbang aksesibilitas yang sebenarnya. Kedua assertion di atas
    // cuma membuktikan halaman tidak rusak; ini yang membuktikan
    // SmoothScrollProvider (Task 6) benar benar tidak menginisialisasi
    // Lenis, bukan menginisialisasi lalu menyembunyikannya secara visual.
    await expect(page.locator("html")).not.toHaveClass(/lenis/);
  });
});
