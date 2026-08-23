import { afterEach, describe, expect, it, vi } from "vitest";
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

  it("ownImage:true melewatkan gambar korporat supaya berkas opengraph-image segmen bisa mengisinya", () => {
    // Diverifikasi empiris (Task 15): berkas per-segmen cuma mengisi
    // openGraph.images kalau field itu kosong sama sekali di objek metadata
    // segmen yang sama -- ia tidak menang paksa atas images yang sudah
    // diset eksplisit di sana.
    const own = buildMetadata({
      title: "Judul Artikel",
      description: "Deskripsi",
      path: "/artikel/contoh",
      ownImage: true,
    });
    expect(own.openGraph?.images).toBeUndefined();
    expect(own.twitter?.images).toBeUndefined();
  });
});

describe("SITE_URL", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("string kosong (ARG Docker yang lupa diisi) gagal keras dengan pesan yang menyebut nama variabel", async () => {
    // Task 21: --build-arg NEXT_PUBLIC_SITE_URL yang lupa diisi membuat ARG
    // terdefinisi sebagai string kosong (bukan undefined), yang lolos dari
    // ??. Tanpa guard ini, kegagalannya baru muncul jauh di new URL("") saat
    // build metadata, dengan pesan yang tidak menyebut nama variabel sama
    // sekali.
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    await expect(async () => {
      vi.resetModules();
      await import("./metadata");
    }).rejects.toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it("undefined jatuh ke localhost untuk dev lokal", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", undefined);
    vi.resetModules();
    const mod = await import("./metadata");
    expect(mod.SITE_URL).toBe("http://localhost:3000");
  });
});
