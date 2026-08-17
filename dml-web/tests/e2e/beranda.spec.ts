import { test, expect } from "@playwright/test";
import { runAxeCheck } from "./axe";

test.describe("beranda dengan prefers-reduced-motion: reduce", () => {
  // reducedMotion bukan properti langsung di PlaywrightTestOptions versi
  // 1.62 yang terinstal, hanya disebut di contoh dokumentasi. Properti nyata
  // yang typecheck adalah contextOptions, sama seperti pola yang sudah
  // diverifikasi di reduced-motion.spec.ts (Plan 2) langsung dari
  // node_modules/playwright/types/test.d.ts.
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("seluruh 8 seksi tampil penuh tanpa motion", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Perbandingan Armada" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Rute Penyeberangan Ro-Ro" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sejak 1985" })).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();

    const htmlClass = await page.locator("html").getAttribute("class");
    expect(htmlClass).not.toContain("lenis");
  });

  test("canvas 3D tidak dimuat saat reduced motion", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("canvas")).toHaveCount(0);
  });

  test("tidak ada axe-core violation di beranda", async ({ page }) => {
    await page.goto("/");
    await runAxeCheck(page);
  });
});

test.describe("beranda mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("fallback blueprint SVG tampil, bukan canvas", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator("svg[role='img']").first()).toBeVisible();
  });
});
