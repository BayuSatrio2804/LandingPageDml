import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import type { CertBadge } from "@/content/types";

/**
 * Jembatan koleksi Payload `certifications` ke tipe `CertBadge` yang
 * sudah dipakai hero-copy.tsx. Server-only: payload.find butuh koneksi
 * database.
 */
export const getCertifications = cache(async (): Promise<CertBadge[]> => {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "certifications",
    sort: "order",
    limit: 50,
    depth: 1,
  });

  return result.docs.map((doc) => ({
    name: doc.name,
    assetPath: typeof doc.badge === "object" && doc.badge !== null ? (doc.badge.url ?? "") : "",
    alt: doc.alt,
    source: doc.source,
  }));
});
