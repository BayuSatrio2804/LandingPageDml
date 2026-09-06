import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import { AFILIASI_KLIEN_DEFAULTS, type AfiliasiKlienData } from "@/features/about/afiliasi-klien-defaults";

/**
 * Global Payload `afiliasi-klien` → AfiliasiKlienData. Server-only. Global
 * yang belum pernah disimpan jatuh ke AFILIASI_KLIEN_DEFAULTS.
 *
 * Riwayat: dulu global ini bernama `business-page` (helper
 * `getBusinessPage()`) dan menyimpan seluruh teks halaman hub /bisnis.
 * Halaman itu sudah dihapus; yang tersisa (afiliasi, klien) sekarang dipakai
 * /tentang-kami, jadi global dan helpernya di-rename supaya tidak lagi
 * menyebut halaman yang tidak ada.
 */
export const getAfiliasiKlien = cache(async (): Promise<AfiliasiKlienData> => {
  const payload = await getPayload({ config });
  const doc = await payload.findGlobal({ slug: "afiliasi-klien" });
  if (!doc?.createdAt) return AFILIASI_KLIEN_DEFAULTS;

  const d = AFILIASI_KLIEN_DEFAULTS;
  const afiliasi = doc.afiliasi ?? d.afiliasi;
  const klien = doc.klien ?? d.klien;

  return {
    afiliasi: {
      kicker: afiliasi.kicker,
      heading: afiliasi.heading,
      subtext: afiliasi.subtext,
    },
    klien: {
      kicker: klien.kicker,
      heading: klien.heading,
      stat1Unit: klien.stat1Unit,
      stat1Caption: klien.stat1Caption,
      stat2Value: klien.stat2Value,
      stat2Unit: klien.stat2Unit,
      stat2Caption: klien.stat2Caption,
      placeholderNote: klien.placeholderNote,
    },
  };
});
