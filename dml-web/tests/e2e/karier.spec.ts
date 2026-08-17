import { test, expect } from "@playwright/test";
import { runAxeCheck } from "./axe";

test("empty state karier menjelaskan cara melamar dan tautan WA benar", async ({ page }) => {
  await page.goto("/karier");
  await expect(page.getByText("Belum ada lowongan terbuka saat ini.")).toBeVisible();

  const link = page.getByRole("link", { name: /Kirim lamaran lewat WhatsApp/ });
  await expect(link).toHaveAttribute("href", /^https:\/\/wa\.me\/\d+/);
});

test("aksesibilitas halaman karier", async ({ page }) => {
  await page.goto("/karier");
  await runAxeCheck(page);
});
