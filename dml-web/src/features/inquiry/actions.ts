"use server";

import { headers } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import { inquirySchema } from "./schema";
import { createRateLimiter } from "./rate-limit";

const rateLimiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

export async function submitInquiry(
  input: unknown,
  source: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  // Honeypot dicek sebelum validasi skema: field `website` di schema pakai
  // max(0), jadi isian bot bikin safeParse gagal dan cabang honeypot tidak
  // pernah tercapai kalau dicek sesudahnya. Client tetap menerima respons
  // sukses palsu supaya bot tidak belajar field mana yang jadi jebakan.
  if (
    typeof input === "object" &&
    input !== null &&
    typeof (input as { website?: unknown }).website === "string" &&
    (input as { website?: unknown }).website !== ""
  ) {
    return { ok: true };
  }

  const parsed = inquirySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Periksa kembali isian form." };
  }

  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!rateLimiter.check(ip)) {
    return { ok: false, error: "Terlalu banyak percobaan, coba lagi nanti." };
  }

  const payload = await getPayload({ config });
  await payload.create({
    collection: "inquiries",
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      message: parsed.data.message,
      source,
    },
  });

  return { ok: true };
}
