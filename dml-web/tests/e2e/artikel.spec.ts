import { test, expect } from "@playwright/test";

test("navigasi utama membawa ke daftar artikel", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation").first().getByRole("link", { name: "Artikel" }).click();
  await expect(page).toHaveURL(/\/artikel$/);
  await expect(page.getByRole("heading", { level: 1, name: "Artikel" })).toBeVisible();
});

test("daftar menaut ke halaman detail", async ({ page }) => {
  await page.goto("/artikel");
  await page.getByRole("link", { name: /Operasi ship-to-ship/ }).first().click();
  await expect(page).toHaveURL(/\/artikel\/operasi-ship-to-ship-di-titik-tanpa-jetty$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Operasi ship-to-ship");
});

test("halaman detail merender isi richtext, bukan JSON mentah", async ({ page }) => {
  await page.goto("/artikel/operasi-ship-to-ship-di-titik-tanpa-jetty");
  await expect(page.getByRole("heading", { name: "Empat langkah, dari terminal sampai serah" })).toBeVisible();
  // Kalau serializer gagal, isi Lexical bocor sebagai objek. Jaga eksplisit.
  await expect(page.locator("body")).not.toContainText('"type":"paragraph"');
});

test("slug yang tidak ada memberi 404, bukan halaman kosong", async ({ page }) => {
  const response = await page.goto("/artikel/slug-yang-tidak-pernah-ada");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Halaman tidak ditemukan" })).toBeVisible();
});

test("beranda menampilkan seksi Artikel Terbaru", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Artikel Terbaru" })).toBeVisible();
});

test("sitemap memuat slug artikel", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain("/artikel/operasi-ship-to-ship-di-titik-tanpa-jetty");
});

test("halaman artikel terbaca tanpa JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto("/artikel");
  await expect(page.getByRole("heading", { level: 1, name: "Artikel" })).toBeVisible();

  await page.goto("/artikel/operasi-ship-to-ship-di-titik-tanpa-jetty");
  await expect(page.getByText("Empat langkah, dari terminal sampai serah")).toBeVisible();

  await context.close();
});
