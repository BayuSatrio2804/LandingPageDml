import { test, expect } from "@playwright/test";

test("404 render dokumen bergaya situs dengan lang dan link kembali", async ({ page }) => {
  const response = await page.goto("/halaman-yang-tidak-ada");
  expect(response?.status()).toBe(404);

  await expect(page.locator("html")).toHaveAttribute("lang", "id");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Halaman tidak ditemukan");
  await expect(page.getByRole("link", { name: "Kembali ke beranda" })).toHaveAttribute("href", "/");

  const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bodyBg).toBe("rgb(10, 20, 24)");
});
