import type { CollectionConfig } from "payload";

export const Inquiries: CollectionConfig = {
  slug: "inquiries",
  admin: { useAsTitle: "name", defaultColumns: ["name", "phone", "service", "createdAt"] },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: () => true,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "company", type: "text" },
    { name: "phone", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "service", type: "text" },
    { name: "message", type: "textarea", required: true },
    { name: "source", type: "text", required: true },
  ],
  timestamps: true,
};
