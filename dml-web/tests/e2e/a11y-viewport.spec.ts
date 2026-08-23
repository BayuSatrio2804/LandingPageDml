import { test } from "@playwright/test";
import { runAxeCheck } from "./axe";

// Guard reducedMotion dilepas di Plan 8 setelah Reveal pindah ke fromTo + clearProps.

const ROUTES = [
  "/",
  "/kontak",
  "/tentang-kami",
  "/karier",
  "/bisnis",
  "/bisnis/transportasi-bbm",
  "/bisnis/penumpang-roro",
  "/bisnis/transportasi-bbm/permintaan-informasi",
];
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
