import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import { THEME_PRESETS, type ThemePreset } from "@/lib/theme-presets";

/**
 * Global Payload `appearance` → preset tema. Server-only. Jatuh ke "navy"
 * kalau global belum diseed atau nilainya tidak dikenali.
 */
export const getThemePreset = cache(async (): Promise<ThemePreset> => {
  const payload = await getPayload({ config });
  const doc = await payload.findGlobal({ slug: "appearance" });
  const value = doc?.theme as string | undefined;
  return value && value in THEME_PRESETS ? (value as ThemePreset) : "navy";
});
