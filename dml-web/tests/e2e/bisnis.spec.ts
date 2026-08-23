import { test, expect } from "@playwright/test";

test("navigasi utama membawa ke hub bisnis", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation")
    .first()
    .getByRole("link", { name: "Bisnis Kami" })
    .click();
  await expect(page).toHaveURL(/\/bisnis$/);
  await expect(page.getByRole("heading", { level: 1, name: "Bisnis Kami" })).toBeVisible();
});

test("hub menaut ke kedua halaman lini", async ({ page }) => {
  await page.goto("/bisnis");
  await page.getByRole("link", { name: /Lihat detail Transportasi BBM/ }).click();
  await expect(page).toHaveURL(/\/bisnis\/transportasi-bbm$/);

  await page.goto("/bisnis");
  await page.getByRole("link", { name: /Lihat detail Penyeberangan Ro-Ro/ }).click();
  await expect(page).toHaveURL(/\/bisnis\/penumpang-roro$/);
});

test("halaman lini BBM menampilkan daftar kapal sungguhan", async ({ page }) => {
  await page.goto("/bisnis/transportasi-bbm");
  await expect(page.getByText("MT Ocean River")).toBeVisible();
  await expect(page.getByText("SPOB United X")).toBeVisible();
});

test("tabel lintasan memisahkan operator DML dari Tri Sumaja Lines", async ({ page }) => {
  await page.goto("/bisnis/penumpang-roro");
  const row = page.getByRole("row").filter({ hasText: "Merak - Bakauheni" });
  // Sel terakhir, bukan getByText(/Tri Sumaja Lines/) di seluruh baris:
  // catatan lintasan di sel pertama juga menyebut frasa yang sama.
  const cells = row.getByRole("cell");
  await expect(cells.last()).toHaveText("PT Tri Sumaja Lines");
});

test("tabel lintasan bisa difokuskan keyboard untuk digulir", async ({ page }) => {
  await page.goto("/bisnis/penumpang-roro");
  // Nama aksesibel penuh, bukan /lintasan/i: section pembungkus juga
  // punya accessible name "Lintasan" lewat aria-labelledby.
  const region = page.getByRole("region", { name: "Tabel lintasan penyeberangan" });
  await region.focus();
  await expect(region).toBeFocused();
});

test("form permintaan informasi terisi sesuai query param", async ({ page }) => {
  await page.goto("/bisnis/transportasi-bbm/permintaan-informasi?layanan=penumpang-roro");
  await expect(page.getByLabel("Lini layanan")).toHaveValue("penumpang-roro");
});

test("query param yang tidak dikenali tidak memecahkan halaman", async ({ page }) => {
  const response = await page.goto(
    "/bisnis/transportasi-bbm/permintaan-informasi?layanan=galangan-kapal",
  );
  expect(response?.status()).toBe(200);
  await expect(page.getByLabel("Lini layanan")).toHaveValue("transportasi-bbm");
});

test("form permintaan informasi menampilkan galat validasi", async ({ page }) => {
  await page.goto("/bisnis/transportasi-bbm/permintaan-informasi");
  await page.getByRole("button", { name: "Kirim permintaan" }).click();
  await expect(page.getByText("Nama perusahaan wajib diisi")).toBeVisible();
});

test("halaman bisnis terbaca tanpa JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto("/bisnis");
  await expect(page.getByRole("heading", { level: 1, name: "Bisnis Kami" })).toBeVisible();

  await page.goto("/bisnis/transportasi-bbm");
  await expect(page.getByText("MT Ocean River")).toBeVisible();

  await page.goto("/bisnis/penumpang-roro");
  await expect(page.getByText("Merak - Bakauheni")).toBeVisible();

  await context.close();
});

test("tidak ada aset WebGL yang dimuat di halaman bisnis", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/bisnis/transportasi-bbm");
  await page.waitForLoadState("load");
  // Bukan networkidle: item nav "Artikel" sengaja tetap menaut ke /artikel
  // yang 404 (keputusan Task 17), dan prefetch RSC Next.js atasnya membuat
  // networkidle tidak pernah tercapai dalam batas waktu wajar. Jeda tetap
  // ini cukup untuk menangkap import WebGL asinkron mana pun kalau ada.
  await page.waitForTimeout(2000);
  // Halaman bisnis adalah dokumen operasional. Model GLB dan loader Draco
  // milik komparator armada 3D di beranda; kalau salah satu terbawa ke sini,
  // pengunjung procurement membayar megabyte untuk sesuatu yang tidak tampil.
  expect(requests.filter((url) => /\.glb$|draco/i.test(url))).toEqual([]);
});
