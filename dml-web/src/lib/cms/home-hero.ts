import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import { HOME_HERO_DEFAULTS, type HomeHeroData } from "@/features/home/hero-defaults";

/**
 * Global Payload `home-hero` → bentuk HomeHeroData yang dipakai komponen
 * hero Beranda. Server-only (findGlobal butuh koneksi database).
 *
 * findGlobal pada global yang belum pernah disimpan mengembalikan nilai
 * default field tanpa createdAt terisi. Di kondisi itu kita kembalikan
 * HOME_HERO_DEFAULTS supaya build sebelum seed tetap menghasilkan hero
 * yang benar, bukan hero dengan field kosong.
 */
export const getHomeHero = cache(async (): Promise<HomeHeroData> => {
  const payload = await getPayload({ config });
  const doc = await payload.findGlobal({ slug: "home-hero" });
  if (!doc?.createdAt) return HOME_HERO_DEFAULTS;

  return {
    eyebrow: doc.eyebrow,
    headline: doc.headline,
    subheadline: doc.subheadline,
    scrollLabel: doc.scrollLabel,
    bbm: {
      label: doc.bbm.label,
      value: doc.bbm.value,
      unit: doc.bbm.unit,
      description: doc.bbm.description,
      ctaLabel: doc.bbm.ctaLabel,
    },
    roro: {
      label: doc.roro.label,
      value: doc.roro.value,
      unit: doc.roro.unit,
      description: doc.roro.description,
      ctaLabel: doc.roro.ctaLabel,
      ctaHref: doc.roro.ctaHref,
    },
  };
});
