import { test } from "@playwright/test";
import { runAxeCheck } from "./axe";

// Sama seperti tentang-kami.spec.ts: tanpa ini, axe bisa menangkap section
// yang dibungkus Reveal di tengah fade-in GSAP (opacity masih transisi dari
// 0), yang membuat warna teks efektif jadi campuran dengan latar dan gagal
// cek kontras axe secara keliru meski token warna asli lolos WCAG AA nyaman
// di opacity penuh (dijaga tokens.test.ts).
test.use({ contextOptions: { reducedMotion: "reduce" } });

const ROUTES = ["/", "/kontak", "/tentang-kami", "/karier"];
const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

for (const viewport of VIEWPORTS) {
  test.describe(`aksesibilitas ${viewport.name} ${viewport.width}px`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });
    for (const path of ROUTES) {
      test(`tanpa pelanggaran axe di ${path}`, async ({ page }) => {
        await page.goto(path);
        await runAxeCheck(page);
      });
    }
  });
}
