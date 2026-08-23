import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      /**
       * allow menang atas disallow pada pencocokan terpanjang, jadi baris
       * ini membuka justru berkas upload tanpa membuka REST API Payload.
       *
       * Tanpa ini, /api/media/file/... ikut terblokir bersama /api, dan
       * setiap gambar cover artikel jadi tidak bisa dirayapi. Yang paling
       * merugikan bukan Google Images, melainkan JSON-LD Article: propertinya
       * `image` menunjuk URL terblokir, dan rich result-nya dibuang. Tidak
       * ada satu pun pemeriksaan visual yang bisa menangkap ini, karena
       * halaman menampilkan gambarnya lewat /_next/image.
       */
      allow: ["/", "/api/media/file/"],
      disallow: ["/admin", "/api"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
