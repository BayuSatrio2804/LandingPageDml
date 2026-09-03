import type { GlobalConfig } from "payload";
import { revalidateAllGlobalHooks } from "../revalidate-all";

/**
 * Teks halaman /karier dan /kontak. Alamat kantor, telepon, dan daftar
 * lini bisnis tetap dari CompanyProfile / SiteNavigation.
 */
export const ContactCareer: GlobalConfig = {
  slug: "contact-career",
  admin: {
    group: "Halaman: Karier & Kontak",
    description: "Judul dan paragraf di halaman Karier dan halaman Kontak.",
  },
  access: { read: () => true, update: ({ req: { user } }) => Boolean(user) },
  hooks: revalidateAllGlobalHooks,
  fields: [
    {
      type: "collapsible",
      label: "Halaman Karier",
      fields: [
        {
          name: "career",
          type: "group",
          label: false,
          fields: [
            { name: "title", type: "text", required: true },
            { name: "noOpeningsText", type: "text", required: true, admin: { description: "Kalimat status lowongan." } },
            { name: "spontaneousText", type: "textarea", required: true },
            { name: "whatsappButtonLabel", type: "text", required: true },
            {
              name: "whatsappMessage",
              type: "textarea",
              required: true,
              admin: { description: "Teks yang otomatis terisi di WhatsApp saat tombol diklik." },
            },
          ],
        },
      ],
    },
    {
      type: "collapsible",
      label: "Halaman Kontak",
      fields: [
        {
          name: "contact",
          type: "group",
          label: false,
          fields: [
            { name: "title", type: "text", required: true },
            { name: "intro", type: "textarea", required: true },
            { name: "phoneLabel", type: "text", required: true },
            { name: "mapsLinkLabel", type: "text", required: true },
            { name: "perLineHeading", type: "text", required: true },
            { name: "perLineIntro", type: "textarea", required: true },
            { name: "perLineLinkLabel", type: "text", required: true },
          ],
        },
      ],
    },
  ],
};
