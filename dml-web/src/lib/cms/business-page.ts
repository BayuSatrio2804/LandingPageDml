import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import { BISNIS_PAGE_DEFAULTS, type BisnisPageData } from "@/features/bisnis/bisnis-defaults";

/**
 * Global Payload `business-page` → BisnisPageData. Server-only. Global yang
 * belum pernah disimpan jatuh ke BISNIS_PAGE_DEFAULTS. Tiap grup juga
 * di-fallback sendiri: field group di bawah collapsible bisa undefined di
 * tipe hasil generate kalau belum pernah diisi.
 */
export const getBusinessPage = cache(async (): Promise<BisnisPageData> => {
  const payload = await getPayload({ config });
  const doc = await payload.findGlobal({ slug: "business-page" });
  if (!doc?.createdAt) return BISNIS_PAGE_DEFAULTS;

  const d = BISNIS_PAGE_DEFAULTS;
  const hero = doc.hero ?? d.hero;
  const liniUtama = doc.liniUtama ?? d.liniUtama;
  const alurSts = doc.alurSts ?? d.alurSts;
  const afiliasi = doc.afiliasi ?? d.afiliasi;
  const klien = doc.klien ?? d.klien;
  const cta = doc.cta ?? d.cta;

  return {
    hero: {
      title: hero.title,
      intro: hero.intro,
      metrics: (hero.metrics ?? []).map((m) => ({
        value: m.value,
        unit: m.unit,
        label: m.label,
      })),
    },
    liniUtama: {
      panels: (liniUtama.panels ?? []).map((p) => ({
        num: p.num,
        title: p.title,
        summary: p.summary,
        metric: p.metric,
        metricLabel: p.metricLabel,
        bullets: p.bullets ?? [],
        cta: p.cta,
      })),
    },
    alurSts: {
      kicker: alurSts.kicker,
      heading: alurSts.heading,
      intro: alurSts.intro,
      steps: (alurSts.steps ?? []).map((s) => ({ title: s.title, desc: s.desc })),
    },
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
    cta: {
      kicker: cta.kicker,
      heading: cta.heading,
      primaryButtonLabel: cta.primaryButtonLabel,
      secondaryButtonLabel: cta.secondaryButtonLabel,
    },
    sectionIndexLabels: doc.sectionIndexLabels ?? d.sectionIndexLabels,
  };
});
