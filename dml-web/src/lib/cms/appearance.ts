import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import { resolveAccentRamp, type AccentRamp } from "@/lib/theme-presets";

/**
 * Global Payload `appearance` → ramp aksen final (sudah divalidasi kontras;
 * nilai kustom yang tidak lolos otomatis jatuh ke navy). Server-only.
 */
export const getAccentRamp = cache(async (): Promise<AccentRamp> => {
  const payload = await getPayload({ config });
  const doc = await payload.findGlobal({ slug: "appearance" });
  return resolveAccentRamp(
    (doc?.theme as string | undefined) ?? "navy",
    (doc?.customAccent as string | null | undefined) ?? null,
  );
});
