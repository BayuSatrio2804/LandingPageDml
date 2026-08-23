import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export function buildMetadata({
  title,
  description,
  path,
  ownImage = false,
}: {
  title: string;
  description: string;
  path: string;
  /**
   * true untuk halaman yang punya opengraph-image.tsx sendiri di segmen
   * yang sama (artikel, Task 15). Segmen semacam itu TIDAK otomatis
   * mewarisi berkasnya kalau openGraph.images sudah diset eksplisit di
   * sini -- diverifikasi empiris: berkas per-segmen hanya mengisi
   * openGraph.images kalau field itu dibiarkan kosong sama sekali, bukan
   * menang secara otomatis atas objek metadata seperti yang disebut
   * dokumentasi Next soal "file-based metadata has higher priority" (itu
   * berlaku antara file dan objek metadata statis di segmen yang sama saat
   * TIDAK ADA keduanya bentrok eksplisit, bukan override paksa). Set true
   * di sini untuk melewati default korporat dan membiarkan Next mengisinya
   * dari berkas.
   */
  ownImage?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  /**
   * Path statis yang di-commit (scripts/prepare-og-corporate.tsx), bukan
   * konvensi berkas opengraph-image.tsx untuk grup (site). Percobaan
   * pertama Task 14 memakai konvensi berkas grup supaya seluruh halaman
   * mewarisinya otomatis, tapi terbukti gagal: openGraph diset eksplisit
   * di SETIAP halaman di sini (title/description/url berbeda per
   * halaman), dan aturan merge Next bersifat shallow-replace per key --
   * openGraph anak menggantikan SELURUH openGraph induk, termasuk images
   * yang diwariskan lewat konvensi berkas grup. Diverifikasi empiris:
   * dari 7 rute yang diperiksa, cuma "/" yang menyisakan og:image; 6
   * lainnya nihil.
   */
  const openGraphImages = ownImage ? undefined : [{ url: absoluteUrl("/og-corporate.png") }];
  return {
    /**
     * Tanpa metadataBase, gambar OG berpath relatif diresolusi terhadap
     * localhost:3000 dan Next memperingatkannya saat build. Canonical sudah
     * absolut lewat absoluteUrl(), jadi masalahnya cuma menyentuh gambar,
     * dan justru gambar yang paling tidak terlihat rusak sampai ada yang
     * membagikan tautannya.
     */
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "PT Dutabahari Menara Line",
      locale: "id_ID",
      type: "website",
      ...(openGraphImages ? { images: openGraphImages } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ownImage ? {} : { images: [absoluteUrl("/og-corporate.png")] }),
    },
  };
}
