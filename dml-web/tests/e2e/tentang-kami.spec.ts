import { test, expect } from "@playwright/test";
import { runAxeCheck } from "./axe";

// reducedMotion bukan properti langsung di PlaywrightTestOptions versi 1.62
// yang terinstal (lihat reduced-motion.spec.ts). Dipakai di sini supaya
// Reveal (Task 14) tidak pernah mendaftarkan animasi GSAP: tanpa ini, axe
// bisa menangkap section #silsilah/#profil di tengah fade-in (opacity
// GSAP masih transisi dari 0), yang membuat warna teks efektif jadi
// campuran dengan latar dan gagal cek kontras axe secara keliru meski token
// warna asli (ink-muted #8fa1a8, accent #ff5a1f di atas surface #0a1418)
// lolos WCAG AA nyaman di opacity penuh.
test.use({ contextOptions: { reducedMotion: "reduce" } });

test("anchor nav mengarahkan ke section yang benar", async ({ page }) => {
  await page.goto("/tentang-kami");
  // Footer (di semua halaman) juga punya tautan "Company Profile" ke
  // /tentang-kami#profil, dan namanya mengandung substring "Profil" sehingga
  // getByRole tanpa scope mencocokkan dua elemen (strict mode violation).
  // Scope ke AnchorNav (Task 14) supaya cuma tautan anchor-nav yang dipilih.
  await page
    .getByRole("navigation", { name: "Navigasi halaman" })
    .getByRole("link", { name: "Profil" })
    .click();
  await expect(page).toHaveURL(/#profil$/);
  await expect(page.locator("#profil")).toBeInViewport();
});

test("kedua section terbaca tanpa JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/tentang-kami");

  await expect(page.locator("#silsilah")).toBeVisible();
  await expect(page.locator("#profil")).toBeVisible();
  // Footer juga menyebut "sejak 1988", jadi getByText("1988") tanpa scope
  // mencocokkan dua elemen. Scope ke #silsilah supaya cuma entri timeline
  // yang diperiksa.
  await expect(page.locator("#silsilah").getByText("1988")).toBeVisible();

  await context.close();
});

test("aksesibilitas halaman tentang kami", async ({ page }) => {
  await page.goto("/tentang-kami");
  await runAxeCheck(page);
});
