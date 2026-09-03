import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import type { FleetClass } from "@/content/types";

/**
 * Jembatan koleksi Payload `fleet-classes` ke tipe `FleetClass` yang sudah
 * dipakai komponen. `vesselCount` TIDAK disimpan di koleksi `fleet-classes`
 * sendiri — dihitung di sini dengan menghitung baris koleksi `vessels` per
 * `classSlug`, supaya admin menambah/menghapus kapal langsung tercermin di
 * comparator 3D dan tabel spesifikasi tanpa developer ikut mengubah data
 * kelas armada.
 */
export const getFleetClasses = cache(async (): Promise<FleetClass[]> => {
  const payload = await getPayload({ config });
  const [classes, vessels] = await Promise.all([
    payload.find({ collection: "fleet-classes", limit: 50, depth: 0, sort: "order" }),
    payload.find({ collection: "vessels", limit: 200, depth: 0 }),
  ]);

  const countBySlug = new Map<string, number>();
  for (const vessel of vessels.docs) {
    countBySlug.set(vessel.classSlug, (countBySlug.get(vessel.classSlug) ?? 0) + 1);
  }

  return classes.docs.map((doc) => ({
    slug: doc.slug,
    name: doc.name,
    category: doc.category,
    lengthMeters: doc.lengthMeters,
    beamMeters: doc.beamMeters,
    dwt: doc.dwt ?? null,
    capacityLabel: doc.capacityLabel,
    passengerCapacity: doc.passengerCapacity ?? null,
    vesselCount: countBySlug.get(doc.slug) ?? 0,
    altText: doc.altText,
  }));
});
