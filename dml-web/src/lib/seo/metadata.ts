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
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
