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
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = absoluteUrl(path);
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
      /**
       * Path statis yang di-commit (scripts/prepare-og-corporate.tsx), bukan
       * konvensi berkas opengraph-image.tsx. Percobaan pertama memakai
       * konvensi berkas supaya seluruh halaman grup (site) mewarisinya
       * otomatis, tapi terbukti gagal: openGraph di sini diset eksplisit di
       * SETIAP halaman (title/description/url berbeda per halaman), dan
       * aturan merge Next bersifat shallow-replace per key -- openGraph anak
       * menggantikan SELURUH openGraph induk, termasuk images yang
       * diwariskan lewat konvensi berkas. Diverifikasi empiris: dari 7 rute
       * yang diperiksa, cuma "/" yang menyisakan og:image; 6 lainnya nihil.
       * Halaman artikel menimpa array ini lewat opengraph-image.tsx-nya
       * sendiri di segmen yang sama (Task 15), yang menang atas objek
       * metadata biasa pada segmen yang sama menurut dokumentasi Next.
       */
      images: [{ url: absoluteUrl("/og-corporate.png") }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl("/og-corporate.png")],
    },
  };
}
