"use server";

import { headers } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import { inquirySchema, businessInquirySchema } from "./schema";
import { createRateLimiter, clientKeyFrom } from "./rate-limit";

const rateLimiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

/**
 * Batas atas yang tetap berlaku kalau penyerang memutar-mutar x-forwarded-for
 * sehingga bucket per-alamat tidak pernah penuh. Angkanya dipilih supaya tidak
 * pernah tersentuh lalu lintas manusia yang wajar: situs company profile
 * dengan dua form lead tidak menerima 200 kiriman dalam sepuluh menit.
 */
const globalLimiter = createRateLimiter({ limit: 200, windowMs: 10 * 60 * 1000 });

const TRUSTED_PROXY_HOPS = Number(process.env.TRUSTED_PROXY_HOPS ?? "1");

// react-doctor/server-auth-actions: sengaja tanpa auth. Ini form kontak
// publik, pengunjung anonim harus bisa submit tanpa login. Perlindungan
// datang dari honeypot (di atas), validasi skema server-side (safeParse di
// bawah, bukan cuma client), dan rate limit per-IP, bukan dari auth gate,
// sesuai rekomendasi dokumentasi rule ini untuk contact form/newsletter/
// public search: jangan tempel auth() no-op cuma buat bungkam linter.
// react-doctor-disable-next-line react-doctor/server-auth-actions
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

  // Dua skema, satu action. Form B2B mengirim field tambahan; form /kontak
  // tidak. Coba skema yang lebih luas dulu, lalu jatuh ke yang dasar, supaya
  // kiriman /kontak yang tidak punya company tetap lolos apa adanya.
  const business = businessInquirySchema.safeParse(input);
  const parsed = business.success ? business : inquirySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Periksa kembali isian form." };
  }

  const requestHeaders = await headers();
  const ip = clientKeyFrom(requestHeaders.get("x-forwarded-for"), TRUSTED_PROXY_HOPS);

  if (!rateLimiter.check(ip) || !globalLimiter.check("global")) {
    return { ok: false, error: "Terlalu banyak percobaan, coba lagi nanti." };
  }

  // getPayload dan payload.create sama-sama melempar saat Postgres tidak bisa
  // dihubungi. Tanda tangan fungsi ini menjanjikan hasil, bukan lemparan; kalau
  // ia melempar, promise onSubmit di client menolak dan jalur galat form yang
  // sudah ada tidak pernah tercapai. Pengguna melihat tombol ditekan tanpa
  // apa pun terjadi.
  try {
    const payload = await getPayload({ config });
    await payload.create({
      collection: "inquiries",
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email,
        message: parsed.data.message,
        ...(business.success
          ? { company: business.data.company, service: business.data.service }
          : {}),
        source,
      },
    });
  } catch (error) {
    console.error("gagal menyimpan inquiry", error);
    return { ok: false, error: "Pesan gagal terkirim. Coba lagi sebentar lagi." };
  }

  return { ok: true };
}
