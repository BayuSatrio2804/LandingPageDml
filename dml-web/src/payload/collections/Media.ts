import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: { read: () => true },
  upload: {
    imageSizes: [
      { name: "thumbnail", width: 400 },
      { name: "card", width: 1080 },
    ],
    mimeTypes: ["image/*"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      admin: { description: "Alt text bahasa Indonesia, wajib diisi." },
    },
  ],
};
