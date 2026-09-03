import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import {
  HOME_SECTIONS_DEFAULTS,
  type HomeSectionsData,
} from "@/features/home/home-sections-defaults";

/**
 * Global Payload `home-sections` → HomeSectionsData. Server-only.
 * Global yang belum pernah disimpan (findGlobal tanpa createdAt) jatuh ke
 * HOME_SECTIONS_DEFAULTS.
 */
export const getHomeSections = cache(async (): Promise<HomeSectionsData> => {
  const payload = await getPayload({ config });
  const doc = await payload.findGlobal({ slug: "home-sections" });
  if (!doc?.createdAt) return HOME_SECTIONS_DEFAULTS;

  return {
    dayCut: { heading: doc.dayCut.heading, body: doc.dayCut.body },
    affiliates: { heading: doc.affiliates.heading, subtext: doc.affiliates.subtext },
    fleetComparator: {
      heading: doc.fleetComparator.heading,
      description: doc.fleetComparator.description,
      descriptionStatic: doc.fleetComparator.descriptionStatic,
      dragHint: doc.fleetComparator.dragHint,
      gridHint: doc.fleetComparator.gridHint,
    },
    routeMap: { heading: doc.routeMap.heading, description: doc.routeMap.description },
    since1988: {
      heading: doc.since1988.heading,
      counterCaption: doc.since1988.counterCaption,
      foundingSentence: doc.since1988.foundingSentence,
      genealogyLinkLabel: doc.since1988.genealogyLinkLabel,
    },
    stats: {
      shipsLabel: doc.stats.shipsLabel,
      peopleLabel: doc.stats.peopleLabel,
      yearsLabel: doc.stats.yearsLabel,
      portsLabel: doc.stats.portsLabel,
      membershipsHeading: doc.stats.membershipsHeading,
    },
    cta: { heading: doc.cta.heading, buttonLabel: doc.cta.buttonLabel },
  };
});
