import { test, expect } from "@playwright/test";

test("boundary menangkap error dan tetap menampilkan navigasi situs", async ({ page }) => {
  await page.goto("/uji-galat");
  await expect(page.getByRole("heading", { name: /Ada yang salah di halaman ini/ })).toBeVisible();
  // Boundary duduk di dalam layout (site), jadi header dan footer bertahan.
  // Pengunjung yang kena error tidak terdampar tanpa navigasi.
  await expect(page.getByRole("navigation").first()).toBeVisible();
});

test("boundary tidak membocorkan pesan error internal", async ({ page }) => {
  await page.goto("/uji-galat");
  await expect(page.locator("body")).not.toContainText("Galat sengaja untuk menguji");
});

test("tombol kembali ke beranda bekerja", async ({ page }) => {
  await page.goto("/uji-galat");
  await page.getByRole("link", { name: /Kembali ke beranda/ }).click();
  await expect(page).toHaveURL(/\/$/);
});
