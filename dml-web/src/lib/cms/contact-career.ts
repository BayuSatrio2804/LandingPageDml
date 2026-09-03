import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import {
  CONTACT_CAREER_DEFAULTS,
  type ContactCareerData,
} from "@/features/contact/contact-career-defaults";

/**
 * Global Payload `contact-career` → ContactCareerData. Server-only. Global
 * yang belum pernah disimpan jatuh ke CONTACT_CAREER_DEFAULTS.
 */
export const getContactCareer = cache(async (): Promise<ContactCareerData> => {
  const payload = await getPayload({ config });
  const doc = await payload.findGlobal({ slug: "contact-career" });
  if (!doc?.createdAt) return CONTACT_CAREER_DEFAULTS;

  const d = CONTACT_CAREER_DEFAULTS;
  const career = doc.career ?? d.career;
  const contact = doc.contact ?? d.contact;

  return {
    career: {
      title: career.title,
      noOpeningsText: career.noOpeningsText,
      spontaneousText: career.spontaneousText,
      whatsappButtonLabel: career.whatsappButtonLabel,
      whatsappMessage: career.whatsappMessage,
    },
    contact: {
      title: contact.title,
      intro: contact.intro,
      phoneLabel: contact.phoneLabel,
      mapsLinkLabel: contact.mapsLinkLabel,
      perLineHeading: contact.perLineHeading,
      perLineIntro: contact.perLineIntro,
      perLineLinkLabel: contact.perLineLinkLabel,
    },
  };
});
