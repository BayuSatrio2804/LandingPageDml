import type { CollectionConfig } from "payload";
import { revalidateAllCollectionHooks } from "../revalidate-all";

/**
 * Roster 66 kapal bernama dari company profile hal. 04, admin-editable.
 * Dulu hardcode di src/content/vessels.ts.
 *
 * `classSlug` SENGAJA teks bebas, bukan relasi ke koleksi kelas armada:
 * kelas armada (src/content/fleet.ts) tidak ikut dimigrasi fase ini
 * karena dimensinya terikat ke model 3D dan blueprint SVG yang statis
 * (lihat catatan di src/content/fleet.ts). Nilai yang valid saat ini:
 * ro-ro-ferry, motor-tanker, oil-barge, spob, tugboat.
 *
 * `routeId` cuma diisi untuk classSlug "ro-ro-ferry", merujuk id di
 * src/features/route-map/ports.ts (ROUTE_LEGS) — juga tidak divalidasi
 * relasional di skema karena lintasan itu juga tidak dimigrasi.
 */
export const Vessels: CollectionConfig = {
  slug: "vessels",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "classSlug", "routeId"],
    group: "Perusahaan",
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: revalidateAllCollectionHooks,
  fields: [
    { name: "name", type: "text", required: true, unique: true },
    { name: "classSlug", type: "text", required: true, index: true },
    {
      name: "routeId",
      type: "text",
      admin: { description: "Hanya diisi untuk kapal ro-ro-ferry." },
    },
    {
      name: "source",
      type: "select",
      required: true,
      options: ["cp-pdf", "riset-publik", "belum-terverifikasi"],
    },
  ],
  timestamps: true,
};
