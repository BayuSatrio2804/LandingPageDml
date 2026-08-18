import { test, expect } from "@playwright/test";

test.describe("hero tanpa JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("headline, subteks, dan CTA tetap hadir", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByTestId("hero-subteks")).toBeVisible();
    await expect(page.getByRole("link", { name: /hubungi kami/i }).first()).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);
  });
});

test.describe("hero dengan reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("canvas tidak pernah dipasang", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(3000);
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("hero di mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("canvas tidak pernah dipasang di viewport kecil", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(3000);
    await expect(page.locator("canvas")).toHaveCount(0);
  });
});
