import type { CollectionConfig } from "payload";
import { revalidateAllCollectionHooks } from "../revalidate-all";

/**
 * Lima kelas dipakai fleet comparator 3D dan blueprint SVG (Beranda dan
 * halaman /bisnis/*). Dulu hardcode di src/content/fleet.ts.
 *
 * TIDAK ada field `vesselCount` di sini: jumlah kapal per kelas dihitung
 * LIVE dari koleksi `vessels` lewat src/lib/cms/fleet-classes.ts, bukan
 * disimpan sebagai angka statis. Kalau angka itu ikut disimpan di sini,
 * admin menambah/menghapus kapal lewat koleksi `vessels` tidak akan
 * mengubah angka yang tampil, dan dua sumber bisa saling bertentangan.
 *
 * Panjang, lebar, dan DWT TIDAK ada di company profile resmi kecuali
 * Ro-Ro Ferry (data Jambo VIII/X). Lihat catatan lengkap di
 * src/lib/cms/fleet-classes-seed.ts.
 */
export const FleetClasses: CollectionConfig = {
  slug: "fleet-classes",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["order", "name", "category", "lengthMeters"],
    group: "Armada",
    description:
      "5 kelas kapal di komparator 3D Beranda dan di halaman /bisnis/transportasi-bbm & /bisnis/penumpang-roro. Jumlah kapal per kelas dihitung otomatis dari koleksi Vessels.",
  },
  defaultSort: "order",
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: revalidateAllCollectionHooks,
  fields: [
    { name: "slug", type: "text", required: true, unique: true },
    { name: "name", type: "text", required: true },
    { name: "category", type: "text", required: true },
    { name: "lengthMeters", type: "number", required: true },
    { name: "beamMeters", type: "number", required: true },
    {
      name: "dwt",
      type: "number",
      admin: { description: "Kosongkan untuk kelas tanpa DWT, misalnya Ro-Ro Ferry." },
    },
    { name: "capacityLabel", type: "text", required: true },
    {
      name: "passengerCapacity",
      type: "number",
      admin: { description: "Hanya diisi untuk kelas penumpang." },
    },
    { name: "altText", type: "text", required: true },
    {
      name: "order",
      type: "number",
      required: true,
      admin: { description: "Urutan tampil di comparator 3D dan blueprint." },
    },
  ],
  timestamps: true,
};
