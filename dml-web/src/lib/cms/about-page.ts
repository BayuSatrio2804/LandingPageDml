import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import { ABOUT_PAGE_DEFAULTS, type AboutPageData } from "@/features/about/about-defaults";

/**
 * Global Payload `about-page` → AboutPageData. Server-only. Global yang
 * belum pernah disimpan jatuh ke ABOUT_PAGE_DEFAULTS.
 */
export const getAboutPage = cache(async (): Promise<AboutPageData> => {
  const payload = await getPayload({ config });
  const doc = await payload.findGlobal({ slug: "about-page" });
  if (!doc?.createdAt) return ABOUT_PAGE_DEFAULTS;

  return {
    hero: { title: doc.hero.title, intro1: doc.hero.intro1, intro2: doc.hero.intro2 },
    statLabels: {
      years: doc.statLabels.years,
      ships: doc.statLabels.ships,
      people: doc.statLabels.people,
      sectors: doc.statLabels.sectors,
    },
    identity: (doc.identity ?? []).map((block) => ({
      title: block.title,
      lead: block.lead ?? "",
      items: block.items ?? [],
      note: block.note ?? "",
    })),
    coreValues: {
      heading: doc.coreValues.heading,
      intro: doc.coreValues.intro,
      medallionCaption: doc.coreValues.medallionCaption,
    },
    groupChart: {
      heading: doc.groupChart.heading,
      intro: doc.groupChart.intro,
      parentName: doc.groupChart.parentName,
      parentCaption: doc.groupChart.parentCaption,
    },
    legal: {
      heading: doc.legal.heading,
      standardsLabel: doc.legal.standardsLabel,
      membershipsLabel: doc.legal.membershipsLabel,
      footnote: doc.legal.footnote,
    },
    offices: {
      heading: doc.offices.heading,
      intro: doc.offices.intro,
      dmlOwnerLabel: doc.offices.dmlOwnerLabel,
      groupOwnerLabel: doc.offices.groupOwnerLabel,
    },
    cta: {
      heading: doc.cta.heading,
      primaryButtonLabel: doc.cta.primaryButtonLabel,
      secondaryButtonLabel: doc.cta.secondaryButtonLabel,
    },
  };
});
