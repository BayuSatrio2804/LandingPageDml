import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import {
  BISNIS_SUBPAGES_DEFAULTS,
  type BisnisSubpagesData,
} from "@/features/bisnis/subpages-defaults";

/**
 * Global Payload `business-subpages` → BisnisSubpagesData. Server-only.
 * Global yang belum pernah disimpan jatuh ke BISNIS_SUBPAGES_DEFAULTS.
 */
export const getBusinessSubpages = cache(async (): Promise<BisnisSubpagesData> => {
  const payload = await getPayload({ config });
  const doc = await payload.findGlobal({ slug: "business-subpages" });
  if (!doc?.createdAt) return BISNIS_SUBPAGES_DEFAULTS;

  const d = BISNIS_SUBPAGES_DEFAULTS;
  const bbm = doc.bbm ?? d.bbm;
  const roro = doc.roro ?? d.roro;
  const inquiry = doc.inquiry ?? d.inquiry;

  return {
    bbm: {
      eyebrow: bbm.eyebrow,
      title: bbm.title,
      kelasArmadaHeading: bbm.kelasArmadaHeading,
      kelasArmadaDesc: bbm.kelasArmadaDesc,
      sumberNote: bbm.sumberNote,
      daftarKapalHeading: bbm.daftarKapalHeading,
      daftarKapalDesc: bbm.daftarKapalDesc,
      alurHeading: bbm.alurHeading,
      alurDesc: bbm.alurDesc,
      steps: (bbm.steps ?? []).map((s) => ({ title: s.title, body: s.body })),
      standarHeading: bbm.standarHeading,
      ctaLabel: bbm.ctaLabel,
    },
    roro: {
      eyebrow: roro.eyebrow,
      title: roro.title,
      lintasanHeading: roro.lintasanHeading,
      lintasanDesc: roro.lintasanDesc,
      armadaHeading: roro.armadaHeading,
      armadaDesc: roro.armadaDesc,
      lengthLabel: roro.lengthLabel,
      lengthUnit: roro.lengthUnit,
      capacityLabel: roro.capacityLabel,
      tiketHeading: roro.tiketHeading,
      tiketDesc: roro.tiketDesc,
      tiketButtonLabel: roro.tiketButtonLabel,
    },
    inquiry: {
      title: inquiry.title,
      intro: inquiry.intro,
      directContactLabel: inquiry.directContactLabel,
    },
  };
});
