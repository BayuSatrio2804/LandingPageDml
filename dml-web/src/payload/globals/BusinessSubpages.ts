import type { GlobalConfig } from "payload";
import { revalidateAllGlobalHooks } from "../revalidate-all";

/**
 * Teks tiga sub-halaman Bisnis: transportasi BBM, penyeberangan Ro-Ro, dan
 * form permintaan informasi. Tabel armada, lintasan, daftar kapal, dan
 * standar tetap dari koleksi CMS.
 */
export const BusinessSubpages: GlobalConfig = {
  slug: "business-subpages",
  admin: {
    group: "Halaman: Bisnis",
    description:
      "Judul bagian dan paragraf di /bisnis/transportasi-bbm, /bisnis/penumpang-roro, dan halaman form permintaan informasi.",
  },
  access: { read: () => true, update: ({ req: { user } }) => Boolean(user) },
  hooks: revalidateAllGlobalHooks,
  fields: [
    {
      type: "collapsible",
      label: "Transportasi BBM",
      fields: [
        {
          name: "bbm",
          type: "group",
          label: false,
          fields: [
            { name: "eyebrow", type: "text", required: true },
            { name: "title", type: "text", required: true },
            { name: "kelasArmadaHeading", type: "text", required: true },
            { name: "kelasArmadaDesc", type: "textarea", required: true },
            { name: "sumberNote", type: "textarea", required: true, admin: { description: "Catatan kecil di bawah tabel kelas." } },
            { name: "daftarKapalHeading", type: "text", required: true },
            { name: "daftarKapalDesc", type: "textarea", required: true },
            { name: "alurHeading", type: "text", required: true },
            { name: "alurDesc", type: "textarea", required: true },
            {
              name: "steps",
              type: "array",
              minRows: 1,
              labels: { singular: "Langkah", plural: "Langkah" },
              fields: [
                { name: "title", type: "text", required: true },
                { name: "body", type: "textarea", required: true },
              ],
            },
            { name: "standarHeading", type: "text", required: true },
            { name: "ctaLabel", type: "text", required: true, admin: { description: "Teks tombol ke form permintaan informasi." } },
          ],
        },
      ],
    },
    {
      type: "collapsible",
      label: "Penyeberangan Ro-Ro",
      fields: [
        {
          name: "roro",
          type: "group",
          label: false,
          fields: [
            { name: "eyebrow", type: "text", required: true },
            { name: "title", type: "text", required: true },
            { name: "lintasanHeading", type: "text", required: true },
            { name: "lintasanDesc", type: "textarea", required: true },
            { name: "armadaHeading", type: "text", required: true },
            { name: "armadaDesc", type: "textarea", required: true },
            { name: "lengthLabel", type: "text", required: true },
            { name: "lengthUnit", type: "text", required: true },
            { name: "capacityLabel", type: "text", required: true },
            { name: "tiketHeading", type: "text", required: true },
            { name: "tiketDesc", type: "textarea", required: true },
            { name: "tiketButtonLabel", type: "text", required: true },
          ],
        },
      ],
    },
    {
      type: "collapsible",
      label: "Form permintaan informasi",
      fields: [
        {
          name: "inquiry",
          type: "group",
          label: false,
          fields: [
            { name: "title", type: "text", required: true },
            { name: "intro", type: "textarea", required: true },
            { name: "directContactLabel", type: "text", required: true },
          ],
        },
      ],
    },
  ],
};
