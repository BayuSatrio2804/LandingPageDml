import { describe, expect, it } from "vitest";
import { buildMetadata, absoluteUrl, SITE_URL } from "./metadata";

describe("buildMetadata", () => {
  const meta = buildMetadata({
    title: "Judul",
    description: "Deskripsi",
    path: "/contoh",
  });

  it("menyetel metadataBase", () => {
    // Tanpa ini, openGraph.images berpath relatif akan diresolusi terhadap
    // localhost dan kartu OG-nya tidak pernah tampil saat dibagikan.
    expect(meta.metadataBase?.toString()).toBe(new URL(SITE_URL).toString());
  });

  it("canonical tetap absolut", () => {
    expect(String(meta.alternates?.canonical)).toBe(absoluteUrl("/contoh"));
  });

  it("openGraph memakai URL absolut dan locale Indonesia", () => {
    expect(meta.openGraph?.url).toBe(absoluteUrl("/contoh"));
    expect(meta.openGraph).toMatchObject({ locale: "id_ID", type: "website" });
  });
});
