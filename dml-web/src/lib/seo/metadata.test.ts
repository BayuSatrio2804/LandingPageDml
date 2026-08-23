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

  it("openGraph dan twitter punya gambar korporat default", () => {
    // Path statis, bukan konvensi berkas opengraph-image.tsx: percobaan
    // pertama task ini memakai konvensi berkas, tapi terbukti gagal karena
    // openGraph yang diset eksplisit di sini (title/description/url per
    // halaman) menggantikan SELURUH openGraph induk lewat shallow-replace
    // Next, termasuk images yang diwariskan lewat konvensi berkas. Path
    // statis di sini kebal terhadap masalah itu karena tidak bergantung pada
    // inheritance sama sekali.
    expect(meta.openGraph?.images).toEqual([{ url: absoluteUrl("/og-corporate.png") }]);
    expect(meta.twitter).toMatchObject({
      images: [absoluteUrl("/og-corporate.png")],
    });
  });
});
