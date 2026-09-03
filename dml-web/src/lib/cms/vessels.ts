import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Vessel } from "@/content/types";

function toVessel(doc: { name: string; classSlug: string; routeId?: string | null; source: Vessel["source"] }): Vessel {
  return {
    name: doc.name,
    classSlug: doc.classSlug,
    source: doc.source,
    ...(doc.routeId ? { routeId: doc.routeId } : {}),
  };
}

/**
 * Jembatan koleksi Payload `vessels` ke tipe `Vessel` yang sudah dipakai
 * komponen. Query `where` dijalankan di Payload, bukan filter di memori:
 * datanya sekarang di DB, jadi menyaring di sana lebih murah daripada
 * menarik seluruh 66 baris tiap kali cuma butuh satu kelas.
 */
export const getVessels = cache(async (): Promise<Vessel[]> => {
  const payload = await getPayload({ config });
  const result = await payload.find({ collection: "vessels", limit: 200, depth: 0 });
  return result.docs.map(toVessel);
});

export async function getVesselsByClass(classSlug: string): Promise<Vessel[]> {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "vessels",
    where: { classSlug: { equals: classSlug } },
    limit: 200,
    depth: 0,
  });
  return result.docs.map(toVessel);
}

export async function getVesselsByRoute(routeId: string): Promise<Vessel[]> {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "vessels",
    where: { routeId: { equals: routeId } },
    limit: 200,
    depth: 0,
  });
  return result.docs.map(toVessel);
}
