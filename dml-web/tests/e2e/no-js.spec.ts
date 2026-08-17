import { test, expect } from "@playwright/test";

test.use({ javaScriptEnabled: false });

test("konten dan navigasi hadir tanpa JavaScript", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  // Setiap tautan navigasi utama harus ada di HTML server.
  for (const label of [
    "Tentang Kami",
    "Bisnis Kami",
    "Karier",
    "Artikel",
    "Kontak",
    "BookJambo",
  ]) {
    await expect(page.getByRole("link", { name: label }).first()).toHaveCount(1);
  }
});

test("halaman kontak, tentang kami, dan karier terbaca tanpa JavaScript", async ({ page }) => {
  for (const path of ["/kontak", "/tentang-kami", "/karier"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});
