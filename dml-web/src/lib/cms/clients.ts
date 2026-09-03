import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Client } from "@/content/types";

/**
 * Jembatan koleksi Payload `clients` ke tipe `Client` yang sudah dipakai
 * komponen. Server-only: payload.find butuh koneksi database.
 */
export const getClients = cache(async (): Promise<Client[]> => {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "clients",
    sort: "order",
    limit: 100,
    depth: 1,
  });

  return result.docs.map((doc) => ({
    id: String(doc.id),
    name: doc.name,
    sector: doc.sector,
    logo: typeof doc.logo === "object" && doc.logo !== null ? (doc.logo.url ?? null) : null,
    source: doc.source,
  }));
});
