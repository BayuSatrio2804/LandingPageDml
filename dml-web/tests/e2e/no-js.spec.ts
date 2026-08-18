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

test("beranda terbaca penuh tanpa JavaScript", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  // Judul kartu lini bisnis dirender sebagai <h2>, dan footer (Plan 2) punya
  // tautan navigasi dengan label teks yang sama persis ("Transportasi BBM",
  // "Penumpang Ro-Ro"), jadi getByText murni melanggar strict mode Playwright
  // (dua elemen cocok). getByRole("heading", ...) menargetkan elemen kartu
  // secara spesifik dan tetap terverifikasi tampil tanpa JavaScript.
  await expect(page.getByRole("heading", { name: "Transportasi BBM" })).toBeVisible();
  // exact: true wajib di sini. Pencocokan nama getByRole default-nya substring,
  // dan seksi peta punya heading "Rute Penyeberangan Ro-Ro" yang ikut cocok,
  // yang berarti dua elemen dan pelanggaran strict mode.
  await expect(
    page.getByRole("heading", { name: "Penyeberangan Ro-Ro", exact: true }),
  ).toBeVisible();
  // Ship-to-ship bukan lagi kartu lini bisnis sejak Plan 5, ia seksi sendiri.
  await expect(page.getByRole("heading", { name: "Ship-to-ship transfer" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Perusahaan afiliasi" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Perbandingan Armada" })).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Rute Penyeberangan Ro-Ro" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Sejak 1988" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Lihat silsilah lengkap" })).toHaveAttribute(
    "href",
    "/tentang-kami#silsilah",
  );

  const ctaLinks = page.getByRole("link", { name: /hubungi kami/i });
  expect(await ctaLinks.count()).toBeGreaterThan(0);
  for (const link of await ctaLinks.all()) {
    await expect(link).toHaveAttribute("href", "/kontak");
  }
});
