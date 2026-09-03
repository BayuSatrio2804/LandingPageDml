import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import type { BusinessLine } from "@/content/types";

/**
 * Jembatan koleksi Payload `business-lines` ke tipe `BusinessLine` yang
 * sudah dipakai komponen. `slug` Payload dipetakan balik jadi field `id`
 * di tipe lama supaya lookup yang sudah ada (`mainLines.find(entry =>
 * entry.id === "transportasi-bbm")`) tidak perlu berubah.
 */
export const getBusinessLines = cache(async (): Promise<{
  mainLines: BusinessLine[];
  affiliates: BusinessLine[];
}> => {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "business-lines",
    sort: "order",
    limit: 50,
    depth: 0,
  });

  const all: BusinessLine[] = result.docs.map((doc) => ({
    id: doc.slug,
    kind: doc.kind,
    number: doc.number,
    title: doc.title,
    operator: doc.operator,
    summary: doc.summary,
    bullets: doc.bullets,
    metric:
      doc.metric?.value && doc.metric?.label
        ? { value: doc.metric.value, label: doc.metric.label }
        : null,
    mediaId: doc.mediaId ?? null,
  }));

  return {
    mainLines: all.filter((line) => line.kind === "lini-utama"),
    affiliates: all.filter((line) => line.kind === "afiliasi"),
  };
});
