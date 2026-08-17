import { test, expect } from "@playwright/test";
import { runAxeCheck } from "./axe";

test("form kontak menampilkan error inline saat validasi gagal", async ({ page }) => {
  await page.goto("/kontak");
  await page.getByLabel("Nama").fill("A");
  await page.getByLabel("Email").fill("bukan-email");
  await page.getByLabel("Pesan").fill("singkat");
  await page.getByRole("button", { name: "Kirim pesan" }).click();

  await expect(page.getByRole("alert").first()).toBeVisible();
});

test("form kontak sukses submit mengalihkan ke WhatsApp", async ({ page, context }) => {
  await page.goto("/kontak");
  await page.getByLabel("Nama").fill("Tes Playwright");
  await page.getByLabel("Nomor telepon").fill("+6281234567890");
  await page.getByLabel("Email").fill("tes-playwright@example.com");
  await page
    .getByLabel("Pesan")
    .fill("Ini pesan tes otomatis dari Playwright, aman dihapus dari admin.");

  // ContactForm memakai window.location.assign, bukan target=_blank, jadi
  // navigasi terjadi di tab yang sama, bukan popup baru. Diverifikasi lewat
  // debug run headless: navigasi ke api.whatsapp.com (redirect dari wa.me)
  // terjadi sekitar 1 detik setelah klik, sebelum paragraf role="status"
  // sempat ter-paint. Menunggu Promise.all atas popup yang tidak pernah
  // datang (timeout 15 detik) sebelum memeriksa status karena itu selalu
  // gagal race melawan navigasi tab yang sama, jadi status tidak dites di
  // sini; bukti submit sukses sebelum redirect ada di
  // src/features/inquiry/actions.test.ts (memverifikasi payload.create
  // dipanggil dengan collection "inquiries" sebelum aksi mengembalikan ok).
  // Test ini fokus ke bukti navigasi WhatsApp saja, dengan popup sebagai
  // kemungkinan tambahan kalau perilaku browser berbeda.
  const popupPromise = context.waitForEvent("page", { timeout: 5_000 }).catch(() => null);
  await page.getByRole("button", { name: "Kirim pesan" }).click();

  const popup = await popupPromise;
  if (popup) {
    expect(popup.url()).toContain("wa.me");
  } else {
    // api.whatsapp.com (tujuan redirect nyata dari wa.me, diverifikasi lewat
    // debug run headless) meletakkan nomor di query param "phone", bukan di
    // path seperti wa.me/<nomor>, jadi kedua bentuk diterima.
    await expect(page).toHaveURL(/wa\.me\/\d+|whatsapp\.com\/.*[?&]phone=\d+/, {
      timeout: 15_000,
    });
  }
});

test("aksesibilitas halaman kontak", async ({ page }) => {
  await page.goto("/kontak");
  await runAxeCheck(page);
});
