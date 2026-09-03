import type { GlobalConfig } from "payload";
import { revalidateAllGlobalHooks } from "../revalidate-all";

/**
 * Menu header dan grup footer, admin-editable. Dulu hardcode di
 * src/content/navigation.ts. Field dicocokkan persis ke tipe
 * `NavItem`/`FooterGroup` di src/content/types.ts.
 */
export const SiteNavigation: GlobalConfig = {
  slug: "site-navigation",
  admin: {
    group: "Situs",
    description: "Menu di header dan grup tautan di footer. Berlaku di semua halaman.",
  },
  hooks: revalidateAllGlobalHooks,
  fields: [
    {
      name: "navItems",
      type: "array",
      required: true,
      minRows: 1,
      admin: { description: "Menu di header, urutan baris adalah urutan tampil." },
      fields: [
        { name: "label", type: "text", required: true },
        { name: "href", type: "text", required: true },
        {
          name: "external",
          type: "checkbox",
          defaultValue: false,
          admin: { description: "Centang kalau tautan keluar dari situs ini." },
        },
      ],
    },
    {
      name: "footerGroups",
      type: "array",
      required: true,
      minRows: 1,
      fields: [
        { name: "heading", type: "text", required: true },
        {
          name: "items",
          type: "array",
          required: true,
          minRows: 1,
          fields: [
            { name: "label", type: "text", required: true },
            { name: "href", type: "text", required: true },
            { name: "external", type: "checkbox", defaultValue: false },
          ],
        },
      ],
    },
  ],
};
