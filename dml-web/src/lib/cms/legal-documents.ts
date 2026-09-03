import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import type { LegalDocument } from "@/content/types";

/**
 * Jembatan koleksi Payload `legal-documents` ke tipe `LegalDocument` yang
 * sudah dipakai `groupedLegalDocuments()` (src/content/about.ts).
 */
export const getLegalDocuments = cache(async (): Promise<LegalDocument[]> => {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "legal-documents",
    sort: "order",
    limit: 50,
    depth: 0,
  });

  return result.docs.map((doc) => ({
    document: doc.document,
    number: doc.number,
    issuer: doc.issuer,
    source: doc.source,
  }));
});
