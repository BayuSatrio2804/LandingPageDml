import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import { BISNIS_PAGE_DEFAULTS, type BisnisPageData } from "@/features/bisnis/bisnis-defaults";

/**
 * Global Payload `business-page` → BisnisPageData. Server-only. Global yang
 * belum pernah disimpan jatuh ke BISNIS_PAGE_DEFAULTS.
 *
 * Sejak halaman hub /bisnis dihapus, global ini cuma menyimpan dua blok
 * (afiliasi, klien) yang sekarang dirender di /tentang-kami.
 */
export const getBusinessPage = cache(async (): Promise<BisnisPageData> => {
  const payload = await getPayload({ config });
  const doc = await payload.findGlobal({ slug: "business-page" });
  if (!doc?.createdAt) return BISNIS_PAGE_DEFAULTS;

  const d = BISNIS_PAGE_DEFAULTS;
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
