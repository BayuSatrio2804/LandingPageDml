import { test, expect } from "@playwright/test";

test("kredit model 3D hadir di footer dan tertaut ke Sketchfab", async ({ page }) => {
  await page.goto("/");
  const credit = page.getByTestId("kredit-model");
  await expect(credit).toBeVisible();
  await expect(credit.getByRole("link", { name: "Art Blender" })).toHaveAttribute(
    "href",
    "https://sketchfab.com/ArtBlender",
  );
});
